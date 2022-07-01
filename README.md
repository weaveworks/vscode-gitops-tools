# GitOps Tools for Visual Studio Code

[![VSCode Marketplace Link](https://vsmarketplacebadge.apphb.com/version-short/weaveworks.vscode-gitops-tools.svg)](https://marketplace.visualstudio.com/items?itemName=Weaveworks.vscode-gitops-tools)
[![Install Counter](https://vsmarketplacebadge.apphb.com/installs/weaveworks.vscode-gitops-tools.svg)](https://marketplace.visualstudio.com/items?itemName=Weaveworks.vscode-gitops-tools)

Weaveworks GitOps Extension provides an intuitive way to manage, troubleshoot and operate your Kubernetes environment following the GitOps operating model, accelerating your development lifecycle and simplifying your continuous delivery pipelines. The extension is built on Flux; to learn more about the GitOps toolkit, visit [FluxCD.io]

Your feedback is very important to us, please help us by [submitting issues](https://github.com/weaveworks/vscode-gitops-tools/issues) for bugs, enhancements and share with us how you are using the extension.

Weaveworks GitOps Extension integrates with [Kubernetes Tools](https://marketplace.visualstudio.com/items?itemName=ms-kubernetes-tools.vscode-kubernetes-tools), [`kubectl`](https://kubernetes.io/docs/reference/kubectl/overview/) and [`flux` (FluxCD)](https://fluxcd.io/) for a consolidated and tightly integrated user experience.

> This extension is under active development and is in a rolling beta release cycle with stable releases. Breaking changes remain a possibility.

# Getting started

In order to use the extension, you must satisfy a few requirements:

- Make sure you have the various tools listed under [Dependencies](#dependencies) installed in your system and available in your `PATH`.
- You must have at least one cluster configured in your `kubectl` config. We rely on the Kubernetes extension to discover and connect to clusters. If you are having issues accessing or viewing your cluster, follow the [documentation provided by the Kubernetes extension](https://github.com/Azure/vscode-kubernetes-tools#working-with-kubeconfigs).

Once you have satisfied these requirements, you are ready to install the GitOps Extension:

- Download the latest `vsix` artifact version from our [Releases](https://github.com/weaveworks/vscode-gitops-tools/releases) page.
- Install it on your local Visual Studio Code following [these instructions](https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix).


# Dependencies

The GitOps Extension depends on the [Kubernetes Tools](https://marketplace.visualstudio.com/items?itemName=ms-kubernetes-tools.vscode-kubernetes-tools) extension, which will be automatically installed on your system if you don't already have it.

You will need `kubectl`, and `flux` CLI at the minimum to use this GitOps extension and its Kubernetes cluster management operations.

For users running clusters in Azure including AKS and Arc clusters, the `az` command line tool is also required.

Tool | Description | Installation
--- | --- | ---
[`kubectl`](https://kubernetes.io/docs/reference/kubectl/overview/) | The kubectl command line tool lets you control Kubernetes clusters.  | [Install Kubectl](https://kubectl.docs.kubernetes.io/installation/kubectl/)
[`flux`](https://fluxcd.io) | Flux is a set of continuous and progressive delivery solutions for Kubernetes. | [Install Flux CLI](https://fluxcd.io/docs/installation/#install-the-flux-cli)
[`git`](https://git-scm.com) | Git is a free and open source distributed version control system. | [Install git](https://git-scm.com/downloads)

Optional tools:

Tool | Description | Installation
--- | --- | ---
[`az`](https://docs.microsoft.com/en-us/cli/azure/) | Azure CLI. (only if using the extension to create or register Azure clusters) | [Install az](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
[`docker`](https://www.docker.com) | Docker is an open platform for developing, shipping, and running applications. | [Install Docker](https://docs.docker.com/get-docker/)


We recommend you install these CLI tools on your system PATH before using GitOps extension. If these tools aren't on your system `PATH`, then some commands may not work. If the extension needs one of the core Kubernetes tools and they are missing, it will prompt you to install them.

# Azure specific recommendations

- Make sure you have [successfully authenticated](https://docs.microsoft.com/en-us/cli/azure/authenticate-azure-cli) on your `az` CLI and have access to the [correct subscription](https://docs.microsoft.com/en-us/cli/azure/account?view=azure-cli-latest#az_account_set) for your AKS or ARC cluster.
- The easiest way to get your AKS or ARC cluster visible by the GitOps and Kubernetes Extensions, is by using the `az` CLI to merge the config for accessing your cluster onto the default `kubectl` config. Use `get-credentials` as shown in the [official CLI documentation](https://docs.microsoft.com/en-us/cli/azure/aks?view=azure-cli-latest#az_aks_get_credentials). In order to enable GitOps in a cluster you will likely need the `--admin` credentials.

# Common issues

- `There are no clusters showing in my Clusters pane`: Make sure you have followed the [documentation provided by the Kubernetes extension](https://github.com/Azure/vscode-kubernetes-tools#working-with-kubeconfigs) and confirm that your configuration context shows in a terminal running `kubectl config get-contexts`


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
- Open [GitOps](https://www.weave.works/technologies/gitops/) Documentation links to [Flux](https://fluxcd.io/) and [Weave GitOps](https://www.weave.works/product/gitops-core/) CLI top level topics in your default web browser

# GitOps Commands

You can access GitOps tools check, CLI dependendency versions, Clusters, Sources and Workloads views Focus and Refresh commands by typing `GitOps` in `View -> Command Palette...` menu prompt:

![VSCode GitOps Commands](docs/images/vscode-gitops-commands.png)

# GitOps Feature Contributions

GitOps extension contributes the following Commands, View Containers, Views, and Activation Events to VSCode IDE for working with GitOps Kubernetes clusters:

![VSCode GitOps Features](docs/images/vscode-gitops-features.png)

# Data and telemetry

The GitOps Tools Extension for Visual Studio Code collects usage data and sends it to Weaveworks to help improve our products and services. Read our [privacy statement](https://www.weave.works/weaveworks-privacy-policy/) to learn more. This extension respects the `telemetry.enableTelemetry` setting.

[FluxCD.io]: https://fluxcd.io/
