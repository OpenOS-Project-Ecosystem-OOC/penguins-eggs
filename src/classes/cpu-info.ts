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
 *    Bundled per-arch at scripts/cpuinfo/cpu-info-<arch>, with a fallback to
 *    any system-installed `cpuinfo` / `cpu-info` binary. Provides deep
 *    cross-arch introspection: SoC name, microarchitecture, core counts.
 *    Source: https://github.com/pytorch/cpuinfo
 *
 *    Output format (plain text, no JSON support in the CLI tool):
 *      Packages:
 *        0: Intel Xeon Platinum 8375C
 *      Microarchitectures:
 *        1x Sunny Cove
 *      Cores:
 *        0: 2 processors (0-1), Intel Sunny Cove
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

// Map Node.js process.arch to the bundled cpu-info binary name.
// Bundled binaries live at scripts/cpuinfo/cpu-info-<arch>.
const ARCH_BINARY_MAP: Record<string, string> = {
   x64: 'cpu-info-amd64',
   arm64: 'cpu-info-arm64',
   ia32: 'cpu-info-i386',
   riscv64: 'cpu-info-riscv64',
}

/**
 * Resolve the cpuinfo binary to use.
 *
 * Priority:
 *   1. Bundled binary at scripts/cpuinfo/cpu-info-<arch>  (always preferred)
 *   2. System-installed `cpuinfo` on PATH                 (fallback)
 *   3. null — cpuinfo unavailable
 */
function resolveCpuinfoBin(): null | string {
   const archBinary = ARCH_BINARY_MAP[process.arch]
   if (archBinary) {
      const bundled = path.resolve(__dirname, `../../scripts/cpuinfo/${archBinary}`)
      if (fs.existsSync(bundled)) return bundled
   }

   // Fall back to system installation
   const system = shx.which('cpuinfo') ?? shx.which('cpu-info')
   return system ?? null
}

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

      const cpuinfoBin = resolveCpuinfoBin()
      if (!cpuinfoBin) return info

      info.cpuinfoAvailable = true
      this.populateFromText(info, cpuinfoBin)
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
    * Populate ICpuInfo by parsing the plain-text output of the cpu-info binary.
    *
    * Expected format:
    *   Packages:
    *     0: Intel Xeon Platinum 8375C        <- processorName
    *   Microarchitectures:
    *     1x Sunny Cove                       <- microarchitecture (strip leading count)
    *   Cores:
    *     0: 2 processors (0-1), Intel ...    <- core count (number of tab-indented lines)
    */
   private static populateFromText(info: ICpuInfo, cpuinfoBin: string): void {
      const result = shx.exec(`"${cpuinfoBin}"`, { silent: true })
      if (result.code !== 0 || !result.stdout.trim()) return

      const lines = result.stdout.split('\n')
      let section = ''
      let coreCount = 0

      for (const line of lines) {
         const trimmed = line.trim()
         if (!trimmed) continue

         // Section headers end with ':'
         if (!line.startsWith('\t') && trimmed.endsWith(':')) {
            section = trimmed.slice(0, -1).toLowerCase()
            continue
         }

         // Tab-indented lines are section entries
         if (line.startsWith('\t')) {
            if (section === 'packages' && !info.processorName) {
               // "0: Intel Xeon Platinum 8375C" -> strip leading "N: "
               info.processorName = trimmed.replace(/^\d+:\s*/, '')
            } else if (section === 'microarchitectures' && !info.microarchitecture) {
               // "1x Sunny Cove" -> strip leading count
               info.microarchitecture = trimmed.replace(/^\d+x\s*/, '')
            } else if (section === 'cores') {
               coreCount++
            }
         }
      }

      if (coreCount > 0) info.cores = coreCount
   }
}
