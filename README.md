# penguins-eggs — OpenOS Project fork

> Forked from [penguins-eggs upstream](https://gitlab.com/openos-project/upstream-mirrors/penguins-eggs)
> ([GitHub mirror](https://github.com/pieroproietti/penguins-eggs)).

**penguins-eggs** is a console tool for remastering Linux systems and
redistributing them as live images on USB sticks or via PXE. This fork,
maintained by the [OpenOS Project](https://gitlab.com/openos-project), extends
the upstream with a large set of integrations, new commands, platform support,
and bundled tooling — all tracked on the `all-features` branch.

---

## Contents

- [Getting started](#getting-started)
- [What this fork adds](#what-this-fork-adds)
  - [CPU detection](#cpu-detection)
  - [New commands](#new-commands)
  - [Android support](#android-support)
  - [ChromiumOS support](#chromiumos-support)
  - [Gentoo support](#gentoo-support)
  - [Ecosystem tools](#ecosystem-tools)
  - [Plugin integrations](#plugin-integrations)
  - [Compression backends](#compression-backends)
  - [Disk image output formats](#disk-image-output-formats)
  - [Rootfs source options](#rootfs-source-options)
  - [CI/CD](#cicd)
- [Submodule setup](#submodule-setup)

---

## Getting started

Install from the upstream as documented in the
[upstream README](https://github.com/pieroproietti/penguins-eggs#installation),
then switch to this fork's remote to access the additional features:

```bash
git remote add openos https://gitlab.com/openos-project/penguins-eggs_deving/penguins-eggs.git
git fetch openos
git checkout openos/all-features
```

---

## What this fork adds

### CPU detection

Two CPU detection tools are bundled in `scripts/` — no system packages required.

#### x86-64-level

[x86-64-level](https://github.com/HenrikBengtsson/x86-64-level) (CC BY-SA 4.0)
reads `/proc/cpuinfo` and reports the x86-64 microarchitecture level of the
current CPU:

| Level | Key instruction sets |
|---|---|
| v1 | SSE, SSE2 (baseline x86-64) |
| v2 | SSE3, SSE4.1, SSE4.2, POPCNT |
| v3 | AVX, AVX2, BMI1, BMI2, FMA |
| v4 | AVX-512F/BW/CD/DQ/VL |

Surfaced in `eggs produce` and `eggs krill` to prevent silent post-install
"Illegal instruction" failures when an ISO built on a higher-level machine is
installed onto a lower-level one.

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

The correct binary is selected automatically at runtime, with a fallback to any
system-installed `cpuinfo`/`cpu-info` on PATH.

**Example output** (`eggs produce`, `eggs krill`, `eggs status`):
```
CPU: x86-64-v3 | Intel Core i7-8650U (Kaby Lake) | 8 cores
```

All logic lives in `src/classes/cpu-info.ts`:

```typescript
CpuInfo.x86Level()        // → 1–4, or 0 on non-x86 / detection failure
CpuInfo.assertX86Level(n) // → true if CPU meets minimum level n
CpuInfo.collect()         // → ICpuInfo (all fields)
CpuInfo.summary()         // → human-readable one-liner
```

---

### New commands

| Command | Description |
|---|---|
| `eggs ai` | AI assistant for penguins-eggs (powered by eggs-ai; supports 7 LLM providers, MCP server, HTTP API) |
| `eggs gui` | Launch the eggs-gui frontend (TUI, desktop, or web) |
| `eggs ipfs` | Manage IPFS distribution of produced ISOs |
| `eggs lfs` | Manage git-lfs tracking for produced ISOs |
| `eggs st` | Produce System Transparency compatible boot artifacts |
| `eggs android produce` | Produce bootable Android images (ISO, raw disk, Waydroid snapshot) |
| `eggs android status` | Show Android build environment status |

---

### Android support

`eggs android produce` generates bootable Android images from a running system:

- **ISO** — x86/x86_64/RISC-V (bootable via GRUB/syslinux)
- **Raw disk image** — ARM (for flashing to physical devices)
- **Waydroid snapshot** — for container-based Android environments

Supports AVB signing, OTA packages, and vendor image extraction. Architecture
is detected automatically via `/proc/cpuinfo` and build props.

---

### ChromiumOS support

`eggs produce --cros-flavour=<flavour>` produces ChromiumOS-based ISOs with a
choice of browser:

| Flavour | Browser |
|---|---|
| `chromium` | Chromium (default) |
| `thorium` | Thorium (AVX-optimised Chromium build) |
| `brave` | Brave |
| `vanadium` | Vanadium (GrapheneOS hardened Chromium) |
| `bromite` | Bromite |
| `cromite` | Cromite |
| `custom` | Any browser via `--cros-browser-repo=<url>` |

dm-verity root integrity and Submarine Boot (verified boot chain) are supported
via `cros_verity.ts` and `submarine_boot.ts`.

---

### Gentoo support

Gentoo Stage3 rootfs can be used as the source for `eggs produce` via the
`gentoo-installer` plugin. Supports GPU/CPU-optimised `make.conf` generation
and binary kernel installation.

---

### Ecosystem tools

Full companion repositories integrated as subtrees with hooks into `eggs produce`:

| Tool | Purpose |
|---|---|
| [penguins-recovery](integrations/penguins-recovery/) | Rescue toolkit; adapters for all distro families; standalone builders |
| [penguins-powerwash](integrations/penguins-powerwash/) | Factory reset: soft / medium / hard / sysprep / hardware modes |
| [penguins-immutable-framework](integrations/penguins-immutable-framework/) | Immutable distro framework: abroot, ashos, frzr, akshara, btrfs-dwarfs |
| [penguins-kernel-manager](integrations/penguins-kernel-manager/) | Kernel lifecycle: fetch → patch → compile → install → hold → remove |
| [penguins-eggs-audit](integrations/penguins-eggs-audit/) | Security audit + SBOM: vouch, syft, grant, OS hardening (39 projects, 8 domains) |
| [eggs-gui](integrations/eggs-gui/) | Unified GUI: Go daemon + BubbleTea TUI + NodeGUI desktop + NiceGUI web |
| [eggs-ai](integrations/eggs-ai/) | AI assistant: diagnostics, build guidance, MCP server, HTTP API, 7 LLM providers |
| [penguins-distrobuilder](integrations/penguins-distrobuilder/) | Unified distrobuilder: lxc/distrobuilder (Go) + distrobuilder-menu (Python TUI) |
| [penguins-incus-platform](integrations/penguins-incus-platform/) | Simplestreams image server for LXC/LXD/Incus; multi-distro manifests |
| [penguins-incus-hub](integrations/penguins-incus-hub/) | Integration layer for penguins-incus-platform: embeds PIP daemon + CLI into ISOs |

Each tool hooks into `eggs produce` lifecycle events (pre-build, post-build,
pre-reset, post-reset) — see
[integrations/INTEGRATIONS.md](integrations/INTEGRATIONS.md) for the full hook
matrix.

---

### Plugin integrations

46 plugins across 6 domains, available via the `penguins-eggs-integrations`
package in `integrations/`:

#### Build infrastructure

| Plugin | Purpose |
|---|---|
| `st-output` | System Transparency boot artifacts |
| `btrfs-snapshot` | Git-like Btrfs snapshots around `eggs produce` |
| `dwarfs-compress` | High-compression FUSE filesystem (up to 16x ratio) |
| `erofs-compress` | Kernel-native read-only compressed filesystem |
| `fuse-overlayfs` | Rootless overlay filesystem for container builds |
| `verity-squash` | dm-verity + SquashFS + Secure Boot UKI signing |
| `go-dmverity` | dm-verity hash tree generation (Go) |
| `btrfs-compat` | Btrfs kernel feature compatibility gating |
| `mkosi` | Bespoke OS disk image builder; base rootfs + UKI pipeline |
| `buildroot` | Cross-compiled embedded Linux rootfs as eggs source |
| `embiggen-disk` | Live partition + filesystem resize (post-install expansion) |
| `gpt-image` | Bootable GPT disk image (UEFI, USB, VM) |
| `partitionfs` | Rootless FUSE partition access for disk images |
| `partymix` | MBR disk image assembly for legacy BIOS targets |

#### Config management

| Plugin | Purpose |
|---|---|
| `wardrobe-browse` | Browse wardrobe costumes interactively |
| `wardrobe-merge` | Merge two wardrobes |
| `wardrobe-mount` | Mount a wardrobe costume as an overlay |
| `wardrobe-read` | Read and validate wardrobe YAML |

#### Decentralized distribution

| Plugin | Purpose |
|---|---|
| `brig-publish` | Publish ISOs to IPFS via brig |
| `ipgit-remote` | Git remote backed by IPFS |
| `lfs-ipfs` | Store git-lfs objects on IPFS |

#### Distribution

| Plugin | Purpose |
|---|---|
| `lfs-tracker` | LFS tracking for large ISO artifacts |
| `opengist-sharing` | ISO sharing via self-hosted Gist |
| `gentoo-installer` | Gentoo Stage3 rootfs + GPU/CPU-optimised make.conf |

#### Dev workflow

| Plugin | Purpose |
|---|---|
| `ts-ci` | TypeScript CI workflow generation |
| `security-scan` | SAST, SBOM, CVE scanning, dm-verity tamper-detection CI |
| `pr-automation` | gitstream-based PR automation |

#### Packaging

| Plugin | Purpose |
|---|---|
| `dir-downloader` | Download wardrobe costume directories |
| `gitpack-install` | Install eggs via gitpack |
| `release-downloader` | Download eggs release artifacts |

---

### Compression backends

| Backend | Tool | Ratio | Kernel support | Overlayfs lower |
|---|---|---|---|---|
| SquashFS (default) | `mksquashfs` | ~3x | all | no |
| DwarFS | `mkdwarfs` | up to 16x | FUSE | no |
| EROFS | `mkfs.erofs` | ~2–4x | ≥ 5.4 (native) | **yes** |

---

### Disk image output formats

| Format | Boot firmware | Use case |
|---|---|---|
| `.iso` (default) | BIOS + UEFI hybrid | Universal, optical media |
| `.hdd` / `.vhd` (`gpt-image`) | UEFI only | USB drives, VMs, modern hardware |
| `.img` (`partymix`) | BIOS (MBR) | Legacy hardware, broad compatibility |

---

### Rootfs source options

| Source | Cross-compile | Reproducible |
|---|---|---|
| Running system (default) | no | no |
| `mkosi` (distribution packages) | no | yes |
| `buildroot` (source + cross-toolchain) | **yes** | yes |
| `gentoo-installer` (Stage3 tarball) | no | yes |

---

### CI/CD

A GitLab CI pipeline (`.gitlab-ci.yml`) runs on merge requests and the
`all-features` branch:

| Stage | Jobs |
|---|---|
| `secret-scan` | `npm audit` |
| `test` | `pnpm build`, `pnpm test` |
| `build` | Debian packages, AppImage (on tags) |
| `publish` | npm publish (on tags) |
| `sync` | Daily submodule auto-bump |

---

## Submodule setup

Submodule URLs point to GitLab mirrors at
`https://gitlab.com/openos-project/upstream-mirrors`.

If you have an existing clone, run:
```bash
git submodule sync
git submodule update --init --recursive
```
