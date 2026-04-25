/**
 * ./src/classes/cpu-info.ts
 * penguins-eggs v.25.7.x / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 *
 * CPU detection helpers wrapping two external tools:
 *
 *  - x86-64-level (CC BY-SA 4.0, HenrikBengtsson)
 *    Bundled at scripts/x86-64-level. Reads /proc/cpuinfo and returns
 *    the x86-64 microarchitecture level (1–4) for the current CPU.
 *    Source: https://github.com/HenrikBengtsson/x86-64-level
 *
 *  - cpuinfo CLI (BSD-2, PyTorch/Meta)
 *    Optional system package (`libcpuinfo-dev` / `cpuinfo`). When present,
 *    provides deep cross-arch introspection: SoC name, microarchitecture,
 *    instruction sets, cache topology, and core counts.
 *    Source: https://github.com/pytorch/cpuinfo
 *
 * Both tools are called as child processes; no native bindings are required.
 * cpuinfo is treated as optional — all callers degrade gracefully when absent.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { shx } from '../lib/utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Path to the bundled x86-64-level script (two levels up from src/classes/)
const X86_LEVEL_SCRIPT = path.resolve(__dirname, '../../scripts/x86-64-level')

export interface ICpuInfo {
   /** x86-64 microarchitecture level (1–4), or 0 on non-x86 / detection failure */
   x86Level: number
   /** Human-readable explanation of why the detected level was chosen */
   x86LevelVerbose: string
   /** Processor/SoC name from cpuinfo CLI, or empty string when unavailable */
   processorName: string
   /** Microarchitecture name from cpuinfo CLI, or empty string when unavailable */
   microarchitecture: string
   /** Number of physical cores, or 0 when unavailable */
   cores: number
   /** Whether the cpuinfo CLI tool was found on this system */
   cpuinfoAvailable: boolean
}

/**
 * CpuInfo
 *
 * Static helpers for CPU capability detection. Designed to be called during
 * preflight checks (eggs produce, eggs krill) and status reporting (eggs status).
 */
export default class CpuInfo {
   /**
    * Detect the x86-64 microarchitecture level of the current CPU.
    *
    * Returns 0 on non-x86 architectures or when the bundled script is missing.
    * Returns 1–4 on x86/x86-64 systems.
    */
   static x86Level(): number {
      if (!this.isX86()) return 0
      if (!fs.existsSync(X86_LEVEL_SCRIPT)) return 0

      const result = shx.exec(`bash "${X86_LEVEL_SCRIPT}"`, { silent: true })
      const level = Number.parseInt(result.stdout.trim(), 10)
      return Number.isNaN(level) ? 0 : level
   }

   /**
    * Return a verbose explanation of the detected x86-64 level.
    *
    * Example output:
    *   "Identified x86-64-v3, because x86-64-v4 requires 'avx512f', which
    *    is not supported by this CPU [Intel Core i7-8650U]"
    */
   static x86LevelVerbose(): string {
      if (!this.isX86()) return ''
      if (!fs.existsSync(X86_LEVEL_SCRIPT)) return ''

      const result = shx.exec(`bash "${X86_LEVEL_SCRIPT}" --verbose`, { silent: true })
      // --verbose writes the explanation to stderr and the level to stdout;
      // the script merges both to stdout when run non-interactively.
      return (result.stderr || result.stdout).trim()
   }

   /**
    * Assert that the current CPU meets a minimum x86-64 level.
    *
    * Returns true if the CPU meets or exceeds the required level.
    * Returns true unconditionally on non-x86 architectures (no constraint applies).
    */
   static assertX86Level(required: number): boolean {
      if (!this.isX86()) return true
      const current = this.x86Level()
      if (current === 0) return true // detection failed, don't block
      return current >= required
   }

   /**
    * Collect all available CPU information into a single object.
    *
    * x86-64 level is always attempted on x86 systems.
    * cpuinfo fields are populated only when the `cpuinfo` CLI is installed.
    */
   static collect(): ICpuInfo {
      const info: ICpuInfo = {
         x86Level: this.x86Level(),
         x86LevelVerbose: this.x86LevelVerbose(),
         processorName: '',
         microarchitecture: '',
         cores: 0,
         cpuinfoAvailable: false,
      }

      const cpuinfoBin = shx.which('cpuinfo')
      if (!cpuinfoBin) return info

      info.cpuinfoAvailable = true

      // cpuinfo --json is the most reliable output format
      const jsonResult = shx.exec(`${cpuinfoBin} --json`, { silent: true })
      if (jsonResult.code !== 0 || !jsonResult.stdout.trim()) {
         // Fall back to line-based output
         this.populateFromText(info, cpuinfoBin)
         return info
      }

      try {
         const data = JSON.parse(jsonResult.stdout)
         // cpuinfo JSON schema: packages[].name, packages[].processors[].uarch
         if (Array.isArray(data.packages) && data.packages.length > 0) {
            const pkg = data.packages[0]
            info.processorName = pkg.name ?? ''
            if (Array.isArray(pkg.processors) && pkg.processors.length > 0) {
               info.microarchitecture = pkg.processors[0].uarch ?? ''
               info.cores = pkg.processors.length
            }
         }
      } catch {
         this.populateFromText(info, cpuinfoBin)
      }

      return info
   }

   /**
    * Format a short summary string suitable for display in eggs status.
    *
    * Examples:
    *   "x86-64-v3 | Intel Core i7-8650U (Kaby Lake) | 8 cores"
    *   "arm64 | Apple M1 (Firestorm) | 8 cores"
    *   "x86-64-v2"
    */
   static summary(): string {
      const info = this.collect()
      const parts: string[] = []

      if (info.x86Level > 0) {
         parts.push(`x86-64-v${info.x86Level}`)
      } else if (!this.isX86()) {
         parts.push(process.arch)
      }

      if (info.processorName) {
         const name = info.microarchitecture
            ? `${info.processorName} (${info.microarchitecture})`
            : info.processorName
         parts.push(name)
      }

      if (info.cores > 0) {
         parts.push(`${info.cores} cores`)
      }

      return parts.join(' | ')
   }

   // ---------------------------------------------------------------------------
   // Private helpers
   // ---------------------------------------------------------------------------

   private static isX86(): boolean {
      return process.arch === 'x64' || process.arch === 'ia32'
   }

   /**
    * Populate ICpuInfo from plain-text cpuinfo output as a fallback
    * when JSON output is unavailable.
    */
   private static populateFromText(info: ICpuInfo, cpuinfoBin: string): void {
      const result = shx.exec(`${cpuinfoBin}`, { silent: true })
      if (result.code !== 0) return

      for (const line of result.stdout.split('\n')) {
         const lower = line.toLowerCase()
         if (lower.includes('package') && lower.includes(':')) {
            info.processorName = line.split(':').slice(1).join(':').trim()
         } else if (lower.includes('uarch') && lower.includes(':')) {
            info.microarchitecture = line.split(':').slice(1).join(':').trim()
         } else if (lower.includes('processors') && lower.includes(':')) {
            const n = Number.parseInt(line.split(':').slice(1).join(':').trim(), 10)
            if (!Number.isNaN(n)) info.cores = n
         }
      }
   }
}
