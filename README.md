# vscode-gitops-tools

<h1 align="center">
  <br />
    <img src="resources/icons/gitops-logo.png" alt="GitOps" width="200" />
  <br />
  GitOps Tools for Visual Studio Code
  <br />
  <br />
</h1>

Weaveworks GitOps Extension provides an intuitive way to manage, troubleshoot and operate your Kubernetes environment following the GitOps operating model, accelerating your development lifecycle and simplifying your continous delivery pipelines.

Your feedback is very important to us, please help us by submitting issues for bugs, enhancements and share with us how you are using the extension.

Weaveworks GitOps Extension integrates with [Kubernetes Tools](https://marketplace.visualstudio.com/items?itemName=ms-kubernetes-tools.vscode-kubernetes-tools), [`kubectl`](https://kubernetes.io/docs/reference/kubectl/overview/) and [`flux`](https://fluxcd.io/) for a consolidated and tightly integrated user experience.

> This extension is under active development and currently available as an alpha product.

# Getting started

- Download the latest `vsix` artifact version from our [Releases](https://github.com/weaveworks/vscode-gitops-tools/releases) page
- Install it on your local Visual Studio Code following [these instructions](https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix)

# GUI

![VSCode GitOps Tools](docs/images/vscode-gitops-tools.png)

# Features

- Access to custom GitOps sidebar
- View GitOps Output panel with CLI command traces for diagnostics
- View configured Kubernetes Clusters from `kubectl`
- Enable/Disable GitOps Cluster operations support
- View [GitOps Toolkit components](https://fluxcd.io/docs/components/), version info, and deployment status for the GitOps enabled clusters and Flux controllers
- View Git/Helm Repositories and Bucket Sources info for the selected cluster
- View Kustomizations and Helm Releases for the selected cluster
- View Flux controller logs in the webview editor
- Reconcile Sources and Workloads demand
- Pull Git Repository Source to user machine and open it in VSCode
- Create Git Repository from opened in vscode folder
- Create Kustomization from opened in vscode folder
- Preview short Kubernetes Object info in rich markdown table tooltips on hover for the loaded Clusters, Sources, and Workloads
- Load Kubernetes Object manifest `.yaml` configs in vscode editor via [Kubernetes Tools API](https://github.com/Azure/vscode-kubernetes-tools-api) and virtual Kubernetes file system provider
- Open [GitOps](https://www.weave.works/technologies/gitops/) Documentation links to [Flux](https://fluxcd.io/) and [Wego](https://www.weave.works/product/gitops-core/) CLI top level topics in your default web browser

# Dependencies

GitOps extension depends on [Kubernetes Tools](https://marketplace.visualstudio.com/items?itemName=ms-kubernetes-tools.vscode-kubernetes-tools) extension which is automatically installed with this extension for building apps to run with Kubernetes clusters or troublishooting Kubernetes cluster applications. You may need to invoke the following command line tools, depending on which features you use. You will need `kubectl`, `helm`, and `flux` CLI at the minimum to use this GitOps extension and its Kubernetes cluster management operations.

Tool | Description | Installation
--- | --- | ---
[`kubectl`](https://kubernetes.io/docs/reference/kubectl/overview/) | The kubectl command line tool lets you control Kubernetes clusters.  | [Install Kubectl](https://kubectl.docs.kubernetes.io/installation/kubectl/)
[`flux`](https://fluxcd.io) | Flux is a set of continuous and progressive delivery solutions for Kubernetes. | [Install Flux](https://fluxcd.io/docs/installation/)
[`git`](https://git-scm.com) | Git is a free and open source distributed version control system. (only if using the `sync working copy to repository` feature) | [Install git](https://git-scm.com/downloads)

Optional tools:

Tool | Description | Installation
--- | --- | ---
[`az`](https://docs.microsoft.com/en-us/cli/azure/) | Azure CLI. (only if using the extension to create or register Azure clusters) | [Install az](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
[`docker`](https://www.docker.com) | Docker is an open platform for developing, shipping, and running applications. | [Install Docker](https://docs.docker.com/get-docker/)


We recommend you install these CLI tools on your system PATH before using GitOps extension. If these tools aren't on your system `PATH`, then some commands may not work. If the extension needs one of the core Kubernetes tools and they are missing, it will prompt you to install them.

# GitOps Commands

You can access GitOps tools check, CLI dependendency versions, Clusters, Sources and Workloads views Focus and Refresh commands by typing `GitOps` in `View -> Command Palette...` menu prompt:

![VSCode GitOps Commands](docs/images/vscode-gitops-commands.png)

# GitOps Feature Contributions

GitOps extension contributes the following Commands, View Containers, Views, and Activation Events to VSCode IDE for working with GitOps Kubernetes clusters:

![VSCode GitOps Features](docs/images/vscode-gitops-features.png)

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
