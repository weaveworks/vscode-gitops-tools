# Change Log

See [releases](https://github.com/weaveworks/vscode-gitops-tools/releases) for source code and `vscode-gitops-tools.vsix` extension package download.

# v0.5.0 - [2021-09-30]

- [#27](https://github.com/weaveworks/vscode-gitops-tools/issues/27)
Add Install Flux CLI prompt info message
- [#29](https://github.com/weaveworks/vscode-gitops-tools/issues/29)
Check installed kubectl version on GitOps Terminal initialization and prompt for install
- [#44](https://github.com/weaveworks/vscode-gitops-tools/issues/44)
Show first level of objects created as children of an Application of type Kustomization
- [#48](https://github.com/weaveworks/vscode-gitops-tools/issues/48)
Add flux.ts pseudo-terminal for integrating Flux CLI commands
- [#67](https://github.com/weaveworks/vscode-gitops-tools/issues/67)
Finish Open Cluster info implementation on cluster node click
- [#69](https://github.com/weaveworks/vscode-gitops-tools/issues/69)
Prompt to Install GitOps in Sources and Applications tree views for the selected Cluster without GitOps Enabled
- [#71](https://github.com/weaveworks/vscode-gitops-tools/issues/71)
When flux install is complete, cluster list should auto-refresh
- [#74](https://github.com/weaveworks/vscode-gitops-tools/issues/74)
Add Cluster and Flux Controller deployment state icons
- [#77](https://github.com/weaveworks/vscode-gitops-tools/issues/77)
Create Flux command/status output parser
- [#78](https://github.com/weaveworks/vscode-gitops-tools/issues/78)
Use vscode cloud icon for cluster nodes
- [#80](https://github.com/weaveworks/vscode-gitops-tools/issues/80)
Change Refresh Sources and Applications command labels to match other focus view commands
- [#88](https://github.com/weaveworks/vscode-gitops-tools/issues/88)
Remove yaml icons from app and source tree nodes
- [#89](https://github.com/weaveworks/vscode-gitops-tools/issues/89)
Add Confirmation dialog when enabling gitops on a cluster
- [#91](https://github.com/weaveworks/vscode-gitops-tools/issues/91)
Package Sprint 5 release

# v0.4.0 - [2021-09-23]

- [#17](https://github.com/weaveworks/vscode-gitops-tools/issues/17)
Enable GitOps for existing, not AKS, Kubernetes cluster
- [#42](https://github.com/weaveworks/vscode-gitops-tools/issues/42)
Allow instant reconciliation of any source
- [#43](https://github.com/weaveworks/vscode-gitops-tools/issues/43)
Allow instant reconciliation of any application
- [#70](https://github.com/weaveworks/vscode-gitops-tools/issues/70)
Add GitOps enabled Cluster indicator icons
- [#73](https://github.com/weaveworks/vscode-gitops-tools/issues/73)
Change title of Deployments tree view to Applications
- [#75](https://github.com/weaveworks/vscode-gitops-tools/issues/75)
Add Refresh to Sources and Applications tree view
- [#76](https://github.com/weaveworks/vscode-gitops-tools/issues/76)
Refactor tree view data providers and rename tree view items types to tree nodes to keep them short
- [#79](https://github.com/weaveworks/vscode-gitops-tools/issues/79)
Package Sprint 4 release
- [#81](https://github.com/weaveworks/vscode-gitops-tools/issues/81)
Add GitOps Feature Contributions section to docs

# v0.3.0 - [2021-09-15]

- [#36](https://github.com/weaveworks/vscode-gitops-tools/issues/36)
Cluster tree view - show if gitops is enabled
- [#37](https://github.com/weaveworks/vscode-gitops-tools/issues/37)
Select a cluster to update other tree views
- [#38](https://github.com/weaveworks/vscode-gitops-tools/issues/38)
Ensure single version of gitops terminal is created
- [#40](https://github.com/weaveworks/vscode-gitops-tools/issues/40)
Indicate latest revision fetched by any source
- [#46](https://github.com/weaveworks/vscode-gitops-tools/issues/46)
Investigate using openapi-typescript for kubernetes typescript types generation
- [#49](https://github.com/weaveworks/vscode-gitops-tools/issues/49)
Move kubectl CLI object types/results interfaces to separate .ts files under ./kubernetes folder
- [#50](https://github.com/weaveworks/vscode-gitops-tools/issues/50)
Create GitOps status bar
- [#53](https://github.com/weaveworks/vscode-gitops-tools/issues/53)
Add Flux CLI to Dependencies section in docs
- [#54](https://github.com/weaveworks/vscode-gitops-tools/issues/54)
Add short GitOps extension info and Features section to docs
- [#57](https://github.com/weaveworks/vscode-gitops-tools/issues/57)
Create markdown table hovers for tree view items
- [#59](https://github.com/weaveworks/vscode-gitops-tools/issues/59)
Review, document, and refactor GitOps tree views setup, initialization, context settings, and refreshes
- [#60](https://github.com/weaveworks/vscode-gitops-tools/issues/60)
Open Kubernetes config documents in vscode Editor on tree view nodes click
- [#65](https://github.com/weaveworks/vscode-gitops-tools/issues/65)
Add GitOps Commands section to repo docs
- [#66](https://github.com/weaveworks/vscode-gitops-tools/issues/66)
Package Sprint 3 release

# v0.2.0 - [2021-08-31]

- [#8](https://github.com/weaveworks/vscode-gitops-tools/issues/8)
Create custom GitOps Terminal
- [#10](https://github.com/weaveworks/vscode-gitops-tools/issues/10)
Create custom GitOps Clusters Tree View
- [#18](https://github.com/weaveworks/vscode-gitops-tools/issues/18)
Provide Kubernetes enabled sample application repos, staging environment, and account for testing
- [#19](https://github.com/weaveworks/vscode-gitops-tools/issues/19)
Create GitOps Repositories/Sources tree view
- [#20](https://github.com/weaveworks/vscode-gitops-tools/issues/20)
Create Cluster Deployments tree view
- [#22](https://github.com/weaveworks/vscode-gitops-tools/issues/22)
Add Kubernetes Tools API integration
- [#25](https://github.com/weaveworks/vscode-gitops-tools/issues/25)
Refactor tree views and data providers to support clusters, sources and deployments
- [#26](https://github.com/weaveworks/vscode-gitops-tools/issues/26)
Cleanup new editor config and linters update
- [#31](https://github.com/weaveworks/vscode-gitops-tools/issues/31)
Create changelog for the first 2 iteration releases
- [#33](https://github.com/weaveworks/vscode-gitops-tools/issues/33)
Refactor kubernetesTools interface
- [#35](https://github.com/weaveworks/vscode-gitops-tools/issues/35)
Add Flux check --pre on extension initialization

# v0.1.0 - [2021-08-24]

- [#1](https://github.com/weaveworks/vscode-gitops-tools/issues/1)
Create gitops extension code base setup
- [#2](https://github.com/weaveworks/vscode-gitops-tools/issues/2)
Review vscode k8s tools extension, commands, and potential api integrations
- [#3](https://github.com/weaveworks/vscode-gitops-tools/issues/3)
Create GitOps view container
- [#4](https://github.com/weaveworks/vscode-gitops-tools/issues/4)
Add extra gitOps extension metadata info to manifest
- [#5](https://github.com/weaveworks/vscode-gitops-tools/issues/5)
Add MPL-2.0 license file
- [#6](https://github.com/weaveworks/vscode-gitops-tools/issues/6)
Add Red Hat YAML vscode extension dependency
- [#7](https://github.com/weaveworks/vscode-gitops-tools/issues/7)
Add gitops-logo.svg and png icons for extension and gitops view container in activity bar
- [#9](https://github.com/weaveworks/vscode-gitops-tools/issues/9)
Add GitOps Documentation view to the GitOps sidebar
- [#12](https://github.com/weaveworks/vscode-gitops-tools/issues/12)
Add Kubernetes Tools extension dependency
- [#13](https://github.com/weaveworks/vscode-gitops-tools/issues/13)
Use GitOps for extension name, commands, and views, and drop Weave references
- [#14](https://github.com/weaveworks/vscode-gitops-tools/issues/14)
Add Dev Build instructions to README.md
- [#15](https://github.com/weaveworks/vscode-gitops-tools/issues/15)
Add GitOps extension Packaging and Installation instructions to README.md
- [#16](https://github.com/weaveworks/vscode-gitops-tools/issues/16)
Add Kubernetes Tools Dependencies section to README.md
