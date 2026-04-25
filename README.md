# penguins-eggs

[![sources](https://img.shields.io/badge/github-sources-cyan)](https://github.com/pieroproietti/penguins-eggs)
[![www](https://img.shields.io/badge/www-blog-cyan)](https://penguins-eggs.net)
[![telegram](https://img.shields.io/badge/telegram-group-cyan)](https://t.me/penguins_eggs)
[![basket](https://img.shields.io/badge/basket-naked-blue)](https://penguins-eggs.net/basket/)
[![gdrive](https://img.shields.io/badge/gdrive-all-blue)](https://drive.google.com/drive/folders/19fwjvsZiW0Dspu2Iq-fQN0J-PDbKBlYY)
[![sourceforge](https://img.shields.io/badge/sourceforge-all-blue)](https://sourceforge.net/projects/penguins-eggs/files/)
[![ver](https://img.shields.io/npm/v/penguins-eggs.svg)](https://npmjs.org/package/penguins-eggs)
[![Get it as AppImage](https://img.shields.io/badge/Get%20it%20as-AppImage-important.svg)](https://github.com/pieroproietti/penguins-eggs/releases)

<a href="https://github.com/pieroproietti/coa">
  <img src="https://raw.githubusercontent.com/pieroproietti/penguins-eggs/master/assets/penguins-eggs-logo.png" width="280" height="300" alt="penguins-eggs">
</a>

> This is the [OpenOS Project](https://gitlab.com/openos-project) fork of
> [penguins-eggs](https://github.com/pieroproietti/penguins-eggs), maintained
> on the `all-features` branch. It includes everything from upstream plus
> additional integrations, new commands, Android/ChromiumOS/Gentoo support,
> bundled CPU detection tooling, and a plugin ecosystem.

---

## Contents

- [What is penguins-eggs](#what-is-penguins-eggs)
- [Key capabilities](#key-capabilities)
- [Installation](#installation)
- [Usage](#usage)
- [The Aviary: tools & terminology](#the-aviary-tools--terminology)
- [Commands](#commands)
- [Supported distributions & platforms](#supported-distributions--platforms)
- [This fork: additional features](#this-fork-additional-features)
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
- [GUI](#gui)
- [Book](#book)
- [Links & documentation](#links--documentation)
- [Submodule setup](#submodule-setup)
- [Copyright and licenses](#copyright-and-licenses)

---

## What is penguins-eggs

**penguins-eggs** (or simply `eggs`) is a console tool that allows you to
remaster your system and redistribute it as live images on USB sticks or via
PXE.

Think of it as a way to "hatch" a new system from an existing one — a system
cloning and distribution remastering tool for Linux that produces customized
live ISO images or full system backups.

### The Evolution: [`oa-tools`](https://github.com/pieroproietti/oa-tools)

The upstream author is developing **oa** (a high-performance, C-native
remastering engine) and **coa** (its Go orchestrator) as the next generation of
this project. This new architecture uses native Linux kernel syscalls,
OverlayFS, and Zero-Copy principles.

[![donate](https://img.shields.io/badge/Donate-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/penguinseggs)

---

## Key capabilities

- **Distribution remastering** — craft your own Linux distro or spin of an
  existing one; strip or add components and package it as a new ISO.
- **System backup & cloning** — snapshot your current system including
  installed packages and configurations.
- **Distro-agnostic** — works across Debian, Devuan, Ubuntu, Arch, Fedora,
  AlmaLinux, Rocky, OpenSuSE, Alpine, ChromiumOS, Gentoo, and Android.
- **Multi-architecture** — `i386`, `amd64`, `arm64`, `riscv64` (native
  recursive remastering).
- **Fast & efficient** — OverlayFS avoids physically copying the filesystem;
  zstd compression up to 10x faster than xz.
- **Secure** — LUKS encryption for user data within the ISO; dm-verity root
  integrity; Secure Boot UKI signing.
- **CPU-aware** — detects x86-64 microarchitecture level (v1–v4) and
  processor/SoC details at build and install time.

---

## Installation

### Method 1: Fresh Eggs script (recommended)

Works on all [supported distros](https://github.com/pieroproietti/fresh-eggs/blob/main/SUPPORTED-DISTROS.md).
Automatically configures repositories and installs dependencies.

```bash
git clone https://github.com/pieroproietti/fresh-eggs
cd fresh-eggs
sudo ./fresh-eggs.sh
```

### Method 2: AppImage (universal)

Download the latest AppImage from
[Releases](https://github.com/pieroproietti/penguins-eggs/releases).

Prerequisites (FUSE):
- **Debian/Ubuntu:** `sudo apt-get install fuse libfuse2`
- **Arch:** `sudo pacman -S fuse2`
- **Fedora:** `sudo dnf install fuse fuse-libs`

```bash
chmod +x penguins-eggs-*.AppImage
sudo ./penguins-eggs-*.AppImage
```

### Method 3: Native packages

| Family | Instructions |
|---|---|
| **Debian/Ubuntu** | [Install guide](https://github.com/pieroproietti/penguins-eggs/blob/master/DOCS/INSTALL-DEBIAN-DEVUAN-UBUNTU.md) / [PPA](https://pieroproietti.github.io/penguins-eggs-ppa) |
| **Arch/Manjaro** | AUR and Manjaro Community: `yay penguins-eggs` or `pamac install penguins-eggs` |
| **Fedora/RHEL** | [Fedora guide](https://github.com/pieroproietti/penguins-eggs/blob/master/DOCS/INSTALL-FEDORA.md) / [Enterprise Linux](https://github.com/pieroproietti/penguins-eggs/blob/master/DOCS/INSTALL-ENTERPRISE-LINUX.md) |
| **Alpine** | [penguins-alpine](https://github.com/pieroproietti/penguins-alpine) repo |

### This fork

To use the `all-features` branch of this fork:

```bash
git remote add openos https://gitlab.com/openos-project/penguins-eggs_deving/penguins-eggs.git
git fetch openos
git checkout openos/all-features
```

---

## Usage

### Create a clean ISO

Produces a distributable live ISO without user data:

```bash
sudo eggs produce
```

### Clone your system

| Goal | Command | Notes |
|---|---|---|
| Standard clone | `eggs produce --clone` | User data copied unencrypted — do not share publicly |
| Home encryption | `eggs produce --homecrypt` | `/home` encrypted with LUKS inside the ISO |
| Full encryption | `eggs produce --fullcrypt` | Entire system encrypted (Debian/Devuan only) |

### Compression options

| Flag | Compressor | Use case |
|---|---|---|
| _(default)_ | zstd fast | General use |
| `--pendrive` | zstd level 15 | Optimised for USB drives |
| `--standard` | xz | Smaller size, slower |
| `--max` | xz -Xbcj | Maximum compression |

---

## The Aviary: tools & terminology

`penguins-eggs` uses a bird-themed naming convention for its internal tools:

- **Wardrobe** — organises customisations, scripts, and themes; switch between
  configurations (e.g. bare CLI to full GUI). See
  [penguins-wardrobe](https://github.com/pieroproietti/penguins-wardrobe).
- **Cuckoo** — PXE boot server; boot your ISO on other machines over the local
  network without a USB drive.
- **Yolk** — local package repository bundled inside the ISO for offline
  installation.
- **Krill** — internal CLI/TUI system installer; essential for server installs
  or when no GUI is available.
- **Calamares** — industry-standard GUI installer, automatically configured by
  `eggs` for desktop environments.
- **Mom** — `eggs mom`: interactive help and documentation assistant.
- **Dad** — `eggs dad`: configuration wizard. Run `sudo eggs dad -d` to reset.

---

## Commands

Run `eggs help [COMMAND]` for full flag listings. Core commands:

| Command | Description |
|---|---|
| `eggs produce` | Produce a live ISO from the running system |
| `eggs install` / `eggs krill` | Install the system (TUI installer) |
| `eggs calamares` | Install and configure the Calamares GUI installer |
| `eggs config` | Configure eggs |
| `eggs dad` | TUI configuration wizard |
| `eggs mom` | Interactive help assistant |
| `eggs status` | Show eggs status and system info |
| `eggs wardrobe get/list/show/wear` | Manage wardrobe costumes |
| `eggs cuckoo` | Start PXE server |
| `eggs kill` | Remove the current nest (working ISO directory) |
| `eggs tools clean/repo/skel/stat/yolk` | Maintenance utilities |
| `eggs export iso/pkg/appimage/tarballs` | Export produced artifacts |
| `eggs update` | Update eggs |
| `eggs adapt` | Adapt monitor resolution (VM only) |
| `eggs autocomplete` | Shell autocomplete setup |
| `eggs version` | Show version |

---

## Supported distributions & platforms

`eggs` respects the original package manager and repository lists of each
distribution.

### Linux distributions (upstream)

- **Debian family** — Debian, Devuan, Ubuntu, Linux Mint, Kali, KDE Neon, Pop!_OS
- **Arch family** — Arch Linux, Manjaro, Biglinux, EndeavourOS, Garuda
- **RPM family** — Fedora, AlmaLinux, Rocky Linux, OpenSUSE
- **Others** — Alpine Linux

> For a complete and updated list see
> [SUPPORTED-DISTROS](https://github.com/pieroproietti/fresh-eggs/blob/main/SUPPORTED-DISTROS.md).

### Additional platforms (this fork)

- **ChromiumOS** — 7 browser flavours; dm-verity; Submarine Boot
- **Gentoo** — Stage3 rootfs source via `gentoo-installer` plugin
- **Android** — x86/x86_64/RISC-V ISO; ARM raw disk image; Waydroid snapshot

---

## This fork: additional features

### CPU detection

Two CPU detection tools are bundled in `scripts/` — no system packages required.

#### x86-64-level

[x86-64-level](https://github.com/HenrikBengtsson/x86-64-level) (CC BY-SA 4.0,
Henrik Bengtsson) reads `/proc/cpuinfo` and reports the x86-64
microarchitecture level of the current CPU:

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
system-installed `cpuinfo`/`cpu-info` on PATH, and a graceful no-op if neither
is available.

**Example output** in `eggs produce`, `eggs krill`, and `eggs status`:
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
| `eggs ai` | AI assistant (7 LLM providers, MCP server, HTTP API) |
| `eggs gui` | Launch eggs-gui frontend (TUI, desktop, or web) |
| `eggs ipfs` | Manage IPFS distribution of produced ISOs |
| `eggs lfs` | Manage git-lfs tracking for produced ISOs |
| `eggs st` | Produce System Transparency compatible boot artifacts |
| `eggs android produce` | Produce bootable Android images |
| `eggs android status` | Show Android build environment status |

---

### Android support

`eggs android produce` generates bootable Android images from a running system:

- **ISO** — x86/x86_64/RISC-V, bootable via GRUB/syslinux
- **Raw disk image** — ARM, for flashing to physical devices
- **Waydroid snapshot** — for container-based Android environments

Supports AVB signing, OTA packages, and vendor image extraction. Architecture
is detected automatically via `/proc/cpuinfo` and build props.

---

### ChromiumOS support

`eggs produce --cros-flavour=<flavour>` produces ChromiumOS-based ISOs:

| Flavour | Browser |
|---|---|
| `chromium` | Chromium (default) |
| `thorium` | Thorium (AVX-optimised) |
| `brave` | Brave |
| `vanadium` | Vanadium (GrapheneOS hardened Chromium) |
| `bromite` | Bromite |
| `cromite` | Cromite |
| `custom` | Any browser via `--cros-browser-repo=<url>` |

dm-verity root integrity and Submarine Boot (verified boot chain) are supported.

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
| [penguins-recovery](integrations/penguins-recovery/) | Rescue toolkit; adapters for all distro families |
| [penguins-powerwash](integrations/penguins-powerwash/) | Factory reset: soft / medium / hard / sysprep / hardware modes |
| [penguins-immutable-framework](integrations/penguins-immutable-framework/) | Immutable distro framework: abroot, ashos, frzr, akshara, btrfs-dwarfs |
| [penguins-kernel-manager](integrations/penguins-kernel-manager/) | Kernel lifecycle: fetch → patch → compile → install → hold → remove |
| [penguins-eggs-audit](integrations/penguins-eggs-audit/) | Security audit + SBOM: vouch, syft, grant, OS hardening |
| [eggs-gui](integrations/eggs-gui/) | Unified GUI: Go daemon + BubbleTea TUI + NodeGUI desktop + NiceGUI web |
| [eggs-ai](integrations/eggs-ai/) | AI assistant: diagnostics, build guidance, MCP server, HTTP API |
| [penguins-incus-platform](integrations/penguins-incus-platform/) | Unified Incus platform: daemon + CLI + web UI + QML desktop, OCI image builder, distrobuilder + TUI, simplestreams image server, eggs/recovery hooks |

See [integrations/INTEGRATIONS.md](integrations/INTEGRATIONS.md) for the full
hook matrix (pre-build, post-build, pre-reset, post-reset events).

---

### Plugin integrations

46 plugins across 6 domains via the `penguins-eggs-integrations` package:

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

## GUI

[eggsmaker](https://sourceforge.net/projects/penguins-eggs/files/ISOS/) by
Jorge Maldonado provides a graphical frontend for penguins-eggs. Packages are
available on [Jorge's Google Drive](https://drive.google.com/drive/folders/1hK8OB3e5sM2M9Z_vy1uR3_X7gPdNFYdO).

This fork also ships `eggs gui` — a unified GUI daemon exposing all eggs
operations over JSON-RPC, with BubbleTea TUI, NodeGUI desktop, and NiceGUI web
frontends.

---

## Book

[Hosein Seilany](https://predator-store.com/about-us/), founder of
[predator-os](https://predator-os.ir/), has written a book on penguins-eggs
with the upstream author's participation:

[![book](https://predator-store.com/wp-content/uploads/2025/05/final1-copy-2-1450x2048.jpg?raw=true)](https://predator-store.com/product/penguins-eggs-tool/)

---

## Links & documentation

- **Official website:** [penguins-eggs.net](https://penguins-eggs.net)
- **Blog:** [penguins-eggs.net/blog](https://penguins-eggs.net/blog)
- **User guide:** [eggs-users-guide](https://penguins-eggs.net/docs/Tutorial/eggs-users-guide)
- **Wardrobe guide:** [wardrobe-users-guide](https://penguins-eggs.net/docs/Tutorial/wardrobe-users-guide)
- **5-minute quickstart:** [Cook eggs in 5 minutes](https://penguins-eggs.net/docs/Tutorial/eggs5)
- **FAQ:** [penguins-eggs.net/docs/faq](https://penguins-eggs.net/docs/faq)
- **Changelog:** [CHANGELOG.md](https://github.com/pieroproietti/penguins-eggs/blob/master/CHANGELOG.md)
- **SourceForge ISOs:** [Download examples](https://sourceforge.net/projects/penguins-eggs/files/ISOS/)
- **Upstream GitHub:** [pieroproietti/penguins-eggs](https://github.com/pieroproietti/penguins-eggs)
- **This fork:** [openos-project/penguins-eggs_deving](https://gitlab.com/openos-project/penguins-eggs_deving/penguins-eggs)
- **Plugin integrations:** [integrations/INTEGRATIONS.md](integrations/INTEGRATIONS.md)

---

## Submodule setup

Submodule URLs point to GitLab mirrors at
`https://gitlab.com/openos-project/upstream-mirrors`.

If you have an existing clone, run:
```bash
git submodule sync
git submodule update --init --recursive
```

---

## Copyright and licenses

Copyright (c) 2017, 2026
[Piero Proietti](https://penguins-eggs.net/about-me.html), dual licensed under
the MIT or GPL Version 2 licenses.

OpenOS Project additions are licensed under MIT.

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=pieroproietti/penguins-eggs&type=Date)](https://star-history.com/#pieroproietti/penguins-eggs&Date)
