[update-readmes]   Mode: rewrite — migrating to template structure...
# penguins-eggs

[![Built with Ona](https://ona.com/build-with-ona.svg)](https://app.ona.com/#https://github.com/Interested-Deving-1896/penguins-eggs)

<!-- AI:start:what-it-does -->
This project provides a tool for creating custom Linux system remasters, enabling users to generate personalized ISO images of their operating systems. It supports a wide range of Linux distributions, including Debian, Ubuntu, Arch, Fedora, and others. It is used by system administrators, developers, and advanced users to streamline the process of creating tailored OS distributions for deployment or backup purposes.
<!-- AI:end:what-it-does -->

## Architecture

<!-- AI:start:architecture -->
The project consists of several key components designed to facilitate system remastering across multiple Linux distributions. The core functionality is implemented in TypeScript, leveraging the `@oclif/core` framework for CLI operations. The main executable, defined in `package.json`, is located at `./bin/run.js`. Dependencies include libraries for user prompts, file system operations, network communication, and system information retrieval. Custom integrations are housed in the `./integrations` directory.

The repository is structured as follows:

```plaintext
penguins-eggs/
├── bin/                  # Entry point for CLI commands
├── integrations/         # Custom integrations for supported distributions
├── src/                  # Main source code
├── workflows/            # CI/CD pipeline configurations
├── .github/              # GitHub-specific configurations
├── .gitlab/              # GitLab-specific configurations
├── docs/                 # Documentation files
├── CHANGELOG.md          # Project changelog
├── LICENSE               # License information
├── README.md             # Main project README
```

Components interact primarily through CLI commands, which invoke scripts to manage remastering tasks. External dependencies like `axios` and `systeminformation` handle network requests and system data collection.
<!-- AI:end:architecture -->

## Install

<!-- Add installation instructions here. This section is yours — the AI will not modify it. -->

```bash
git clone https://github.com/Interested-Deving-1896/penguins-eggs.git
cd penguins-eggs
```

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

## Configuration

<!-- Document configuration options here. This section is yours — the AI will not modify it. -->

## CI

<!-- AI:start:ci -->
- `ci.yml`: Runs linting, unit tests, and integration tests for the project. No secrets required.
- `codeql.yml`: Performs static code analysis using GitHub CodeQL. No secrets required.
- `docs.yml`: Builds and deploys documentation to the repository's GitHub Pages. Requires `GH_TOKEN` secret.
- `frogbot-scan.yml`: Scans dependencies for vulnerabilities using JFrog Frogbot. Requires `JFROG_TOKEN` secret.
- `ipfs-mirror.yml`: Mirrors project artifacts to IPFS. Requires `IPFS_API_KEY` secret.
- `iso-test.yml`: Tests ISO creation and validation workflows. No secrets required.
- `mirror.yaml`: Mirrors repository content to external storage. Requires `MIRROR_API_KEY` secret.
- `release.yml`: Automates version tagging and package publishing. Requires `NPM_TOKEN` and `GH_TOKEN` secrets.
- `trigger-artifact-mirror.yml`: Triggers artifact mirroring workflows. No secrets required.
- `trigger-book-sync.yml`: Syncs book-related content across repositories. No secrets required.
<!-- AI:end:ci -->

## Mirror chain

<!-- AI:start:mirror-chain -->
This repo is maintained in [`Interested-Deving-1896/penguins-eggs`](https://github.com/Interested-Deving-1896/penguins-eggs) and mirrored through:

```
Interested-Deving-1896/penguins-eggs  ──►  OpenOS-Project-OSP/penguins-eggs  ──►  OpenOS-Project-Ecosystem-OOC/penguins-eggs
```

Changes flow downstream automatically via the hourly mirror chain in
[`fork-sync-all`](https://github.com/Interested-Deving-1896/fork-sync-all).
Direct commits to OSP or OOC are detected and opened as PRs back to `Interested-Deving-1896`.
<!-- AI:end:mirror-chain -->

## Contributors

<!-- AI:start:contributors -->
[@monstermunchkin](https://github.com/monstermunchkin) - 818 commits  
[@stgraber](https://github.com/stgraber) - 785 commits  
[@itoffshore](https://github.com/itoffshore) - 155 commits  
[@Interested-Deving-1896](https://github.com/Interested-Deving-1896) - 103 commits  
[@pieroproietti](https://github.com/pieroproietti) - 56 commits  
[@ona-agent](https://github.com/ona-agent) - 50 commits  
[@simondeziel](https://github.com/simondeziel) - 32 commits  
[@nanjj](https://github.com/nanjj) - 23 commits  
[@masnax](https://github.com/masnax) - 16 commits  
[@brauner](https://github.com/brauner) - 13 commits  
[@mjrider](https://github.com/mjrider) - 11 commits  
[@tew42](https://github.com/tew42) - 10 commits  
[@ona-bot](https://github.com/ona-bot) - 9 commits  
[@chaosoffire](https://github.com/chaosoffire) - 9 commits  
[@stefanor](https://github.com/stefanor) - 6 commits  
[@rietbergenm](https://github.com/rietbergenm) - 5 commits  
[@Obirvalger](https://github.com/Obirvalger) - 5 commits  
[@nbuwe](https://github.com/nbuwe) - 5 commits  
[@adamcstephens](https://github.com/adamcstephens) - 5 commits  
[@gibmat](https://github.com/gibmat) - 5 commits  
[@hallyn](https://github.com/hallyn) - 5 commits  
[@dependabot[bot]](https://github.com/dependabot[bot]) - 4 commits  
[@web-flow](https://github.com/web-flow) - 4 commits  
[@geaaru](https://github.com/geaaru) - 4 commits  
[@eddyg](https://github.com/eddyg) - 3 commits  
[@tenforward](https://github.com/tenforward) - 3 commits  
[@marcosps](https://github.com/marcosps) - 3 commits  
[@stiltr](https://github.com/stiltr) - 3 commits  
[@timbretimber](https://github.com/timbretimber) - 3 commits  
[@foxtrotcz](https://github.com/foxtrotcz) - 3 commits  

This repository is a mirror. For the upstream source, visit [Interested-Deving-1896/penguins-eggs](https://github.com/Interested-Deving-1896/penguins-eggs).
<!-- AI:end:contributors -->

## Origins

<!-- AI:start:origins -->
_Original project — no upstream fork._
<!-- AI:end:origins -->

## Resources

<!-- AI:start:resources -->
| File | Description |
|---|---|
| [.gitlab/merge_request_templates/Default.md](https://github.com/Interested-Deving-1896/penguins-eggs/blob/main/.gitlab/merge_request_templates/Default.md) | GitLab MR template |
| [config/gitlab-subgroups.yml](https://github.com/Interested-Deving-1896/penguins-eggs/blob/main/config/gitlab-subgroups.yml) | GitLab subgroup map |
<!-- AI:end:resources -->

## License

<!-- AI:start:license -->
<!-- License not detected — add a LICENSE file to this repo. -->
<!-- AI:end:license -->
