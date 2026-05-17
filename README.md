[update-readmes]   Mode: rewrite — migrating to template structure...
# penguins-eggs

[![Built with Ona](https://ona.com/build-with-ona.svg)](https://app.ona.com/#https://github.com/Interested-Deving-1896/penguins-eggs)

<!-- AI:start:what-it-does -->
Penguins Eggs is a remastering tool that allows users to create custom Linux distributions or live ISO images based on various Linux distributions, including Debian, Ubuntu, Arch, Fedora, and others. It is designed for system administrators, developers, and Linux enthusiasts who need to create personalized operating system images for deployment or distribution.
<!-- AI:end:what-it-does -->

## Architecture

<!-- AI:start:architecture -->
The project consists of several key components that work together to provide a remastering tool for various Linux distributions. The core functionality is implemented in TypeScript, leveraging the `@oclif/core` framework for CLI operations. The main entry point for the CLI is defined in `bin/run.js`. Dependencies include libraries for user prompts (`@inquirer/prompts`), file system operations (`fs`), HTTP requests (`axios`), and system information retrieval (`systeminformation`). The project also integrates with external modules, such as `penguins-eggs-integrations` and `@openos-project/penguins-eggs-audit`.

The repository is organized as follows:

```plaintext
.
├── bin/                   # CLI entry point
├── integrations/          # Custom integrations for the tool
├── src/                   # Source code for the application
├── test/                  # Test files
├── .github/               # GitHub workflows and CI/CD configurations
├── .vscode/               # VS Code workspace settings
├── CHANGELOG.md           # Changelog for the project
├── LICENSE                # License file
├── README.md              # Project documentation
├── package.json           # Project metadata and dependencies
└── tsconfig.json          # TypeScript configuration
```

The CLI interacts with the operating system to gather system information, configure remastering options, and generate ISO images. It uses `vite` for building the frontend components and `helia` for handling file system operations. Workflow automation is managed through GitHub Actions, with YAML files in the `.github/workflows` directory.
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
The repository uses GitHub Actions for continuous integration and deployment. Below are the workflows and their purposes:

- **0-build-publish-packages.yaml**: Builds and publishes npm packages. Requires `NPM_TOKEN` secret.
- **1-reindex-repository.yaml**: Reindexes the repository for package updates. No secrets required.
- **ci.yml**: Runs tests and lints the codebase. No secrets required.
- **codeql.yml**: Performs CodeQL analysis for security vulnerabilities. Requires `GH_TOKEN` secret.
- **docs.yml**: Builds and deploys project documentation. Requires `DOCS_DEPLOY_KEY` secret.
- **frogbot-scan.yml**: Scans dependencies for vulnerabilities using Frogbot. Requires `JFROG_API_KEY` secret.
- **ipfs-mirror.yml**: Mirrors artifacts to IPFS. Requires `IPFS_API_KEY` secret.
- **iso-test.yml**: Tests ISO builds for supported distributions. No secrets required.
- **mirror-osp-to-ooc.yaml**: Mirrors repositories between Open Source and Open Core. Requires `MIRROR_API_KEY` secret.
- **mirror.yaml**: Synchronizes mirrors for the project. Requires `MIRROR_API_KEY` secret.
- **release.yml**: Automates the release process, including changelog generation. Requires `GH_TOKEN` and `NPM_TOKEN` secrets.
- **trigger-artifact-mirror.yml**: Triggers artifact mirroring workflows. No secrets required.
- **trigger-book-sync.yml**: Syncs book-related documentation. No secrets required.
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
[@monstermunchkin](https://github.com/monstermunchkin) (818 commits)  
[@stgraber](https://github.com/stgraber) (785 commits)  
[@itoffshore](https://github.com/itoffshore) (155 commits)  
[@Interested-Deving-1896](https://github.com/Interested-Deving-1896) (98 commits)  
[@pieroproietti](https://github.com/pieroproietti) (56 commits)  
[@ona-agent](https://github.com/ona-agent) (50 commits)  
[@simondeziel](https://github.com/simondeziel) (32 commits)  
[@nanjj](https://github.com/nanjj) (23 commits)  
[@masnax](https://github.com/masnax) (16 commits)  
[@brauner](https://github.com/brauner) (13 commits)  
[@mjrider](https://github.com/mjrider) (11 commits)  
[@tew42](https://github.com/tew42) (10 commits)  
[@ona-bot](https://github.com/ona-bot) (9 commits)  
[@chaosoffire](https://github.com/chaosoffire) (9 commits)  
[@stefanor](https://github.com/stefanor) (6 commits)  
[@rietbergenm](https://github.com/rietbergenm) (5 commits)  
[@Obirvalger](https://github.com/Obirvalger) (5 commits)  
[@nbuwe](https://github.com/nbuwe) (5 commits)  
[@adamcstephens](https://github.com/adamcstephens) (5 commits)  
[@gibmat](https://github.com/gibmat) (5 commits)  
[@hallyn](https://github.com/hallyn) (5 commits)  
[@dependabot[bot]](https://github.com/dependabot[bot]) (4 commits)  
[@web-flow](https://github.com/web-flow) (4 commits)  
[@geaaru](https://github.com/geaaru) (4 commits)  
[@eddyg](https://github.com/eddyg) (3 commits)  
[@tenforward](https://github.com/tenforward) (3 commits)  
[@marcosps](https://github.com/marcosps) (3 commits)  
[@stiltr](https://github.com/stiltr) (3 commits)  
[@timbretimber](https://github.com/timbretimber) (3 commits)  
[@foxtrotcz](https://github.com/foxtrotcz) (3 commits)  

*Note: This repository is a mirror. Please refer to the upstream source for additional contributions and updates.*
<!-- AI:end:contributors -->

## Origins

<!-- AI:start:origins -->
_No dependency graph found. Run `generate-dep-graph.yml` to generate `dep-graph/origins.md`._
<!-- AI:end:origins -->

## Resources

<!-- AI:start:resources -->
| File | Description |
|---|---|
| [.gitlab/merge_request_templates/Default.md](https://github.com/Interested-Deving-1896/penguins-eggs/blob/main/.gitlab/merge_request_templates/Default.md) | GitLab MR template |
<!-- AI:end:resources -->

## License

<!-- AI:start:license -->
<!-- License not detected — add a LICENSE file to this repo. -->
<!-- AI:end:license -->
