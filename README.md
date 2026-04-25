# penguins-eggs

> Forked from [penguins-eggs upstream](https://gitlab.com/openos-project/upstream-mirrors/penguins-eggs).

## Submodule URLs

Submodule URLs were updated from GitHub to the GitLab mirrors at
`https://gitlab.com/openos-project/upstream-mirrors`.

If you have an existing clone, run:
```bash
git submodule sync
git submodule update --init --recursive
```

---

## Additions in this fork

### CPU detection

This fork bundles two CPU detection tools that surface hardware capability
information during `eggs produce`, `eggs krill`, and `eggs status`. No system
packages are required — all tools ship inside the `scripts/` directory.

#### x86-64-level

[x86-64-level](https://github.com/HenrikBengtsson/x86-64-level) (CC BY-SA 4.0,
Henrik Bengtsson) is a Bash script that reads `/proc/cpuinfo` and reports which
x86-64 microarchitecture level the current CPU supports:

| Level | Key instruction sets |
|---|---|
| v1 | SSE, SSE2 (baseline x86-64) |
| v2 | SSE3, SSE4.1, SSE4.2, POPCNT |
| v3 | AVX, AVX2, BMI1, BMI2, FMA |
| v4 | AVX-512F/BW/CD/DQ/VL |

This prevents silent post-install failures ("Illegal instruction") when an ISO
built on a v3 machine is installed onto a v2 machine.

#### cpuinfo

[cpuinfo](https://github.com/pytorch/cpuinfo) (BSD-2, PyTorch/Meta) provides
deep cross-architecture CPU introspection: processor/SoC name,
microarchitecture, and core count. Pre-built static binaries are bundled for
every architecture penguins-eggs targets:

| Binary | Architecture |
|---|---|
| `scripts/cpuinfo/cpu-info-amd64` | x86-64 |
| `scripts/cpuinfo/cpu-info-arm64` | AArch64 |
| `scripts/cpuinfo/cpu-info-i386` | x86 32-bit |
| `scripts/cpuinfo/cpu-info-riscv64` | RISC-V 64-bit |

The correct binary is selected automatically at runtime based on the host
architecture, with a fallback to any system-installed `cpuinfo`/`cpu-info` on
PATH, and a graceful no-op if neither is available.

#### What you see

**`eggs produce`** — before the ISO build starts:
```
CPU: x86-64-v3 | Intel Core i7-8650U (Kaby Lake) | 8 cores
```

**`eggs krill`** — before the installer TUI launches:
```
Target CPU: x86-64-v3 | Intel Core i7-8650U (Kaby Lake) | 8 cores
```

**`eggs status`** — new row in the status display:
```
┌ x86-64: v3  cpu: Intel Core i7-8650U  uarch: Kaby Lake  cores: 8 ┐
```

On ARM/RISC-V systems the x86-64 level is omitted and only the cpuinfo fields
are shown.

#### Implementation

All CPU detection logic lives in `src/classes/cpu-info.ts`. The public API:

```typescript
CpuInfo.x86Level()           // → 1–4, or 0 on non-x86 / detection failure
CpuInfo.assertX86Level(n)    // → true if CPU meets minimum level n
CpuInfo.collect()            // → ICpuInfo (all fields)
CpuInfo.summary()            // → human-readable one-liner
```
