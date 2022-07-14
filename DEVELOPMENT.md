# Dev Build

Use the following commands to build GitOps vscode extension locally for testing, debugging, and submitting pull requests (PRs):

```
$ git clone https://github.com/weaveworks/vscode-gitops-tools
$ cd vscode-gitops-tools
$ npm install
$ npm run compile
$ code .
```

Watch for changes:

```
$ npm run-script watch
```

Press `F5` in VSCode to start GitOps extension debug session.

# Packaging and Installation

VSCode extensions are packaged and published with [`vsce`](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) commnand line tool. Use the following steps to create GitOps extension `.vsix` package for local testing or publishing to [VSCode Marketplace](https://marketplace.visualstudio.com/vscode):

1. Install [Node.js](https://nodejs.org)
2. Install [vsce](https://github.com/microsoft/vscode-vsce): ```$ npm install -g vsce```
3. Package GitOps extension: ```$ vsce package```
4. Follow [Install from VSIX](https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix) instructions to install the resulting `vscode-gitops-tools-0.x.0.vsix` extension package in vscode for local testing.

Install from `.vsix` file step is only required for testing the latest version of GitOps extension. Devs and DevOps will be able to download and install it from [VSCode Marketplace](https://marketplace.visualstudio.com/search?term=gitops&target=VSCode) when this vscode extension MVP is released and published.

# Releasing

In order to release a new version the extension, visit the Publish action from [build-vsix.yaml](https://github.com/weaveworks/vscode-gitops-tools/actions/workflows/build-vsix.yml) and run the workflow as a `workflow_dispatch` trigger.

Choose a branch: `main` or `edge`, and set the parameters of Release Type (major, minor, patch) then use the Release Channel (stable) or (prerelease). Stable releases correspond to the `main` branch and prereleases should come from `edge`.

Publish on Visual Studio Marketplace (yes), currently the Open VSX Registry is not supported.

Add your entries to CHANGELOG before publishing the release (or after publishing, in the event that patches are being published frequently the CHANGELOG may be allowed to fall behind, but should be updated in the tree for MINOR releases.)

The release process will update CHANGELOG and populate releases with a list of changes. This looks nicer if "Squash and Merge" is used.

It is not necessary to increment the version number manually in package.json, the release workflow takes care of this.

**Important:** Upon success, the Publish workflow will have created a new GitHub release, pushed the tag, added the CHANGELOG, and submitted a PR from the branch `release-pr` with the updates to `package.json` and `package-lock.json`. The PR MUST be merged to complete the process.

It is not necessary to list this Housekeeping PR in the CHANGELOG, or the PR which updates the CHANGELOG. The goal is to communicate only substantive changes. If PRs are merges with the Squash Merge strategy on GitHub, then the automatic CHANGELOG generation is very neat. If regular merges are used instead, please neaten the CHANGELOG when it is updated.

The `release-pr` branch is updated after the workflow succeeds for **EVERY** release, including edge and stable releases. It must be merged or pulled into the base branch else the release workflow **will fail** on subsequent attempts to publish further releases.
