# Change Log

See [releases](https://github.com/weaveworks/vscode-gitops-tools/releases) for source code and `vscode-gitops-tools.vsix` extension package download, or download this extension from the VSCode Marketplace.

The current release notes are always published on the Releases page, by automation. This `CHANGELOG` is manually curated by a release engineer from those notes for house-keeping.

# v0.25.4

* Fix spawning and not killing `kubectl proxy` processes (#491)
* Recommend settings for log viewer (#487)

# v0.25.3

* Merge pull request for weaveworks/rebase-0.25-edge (#484)
* Upgrade @vscode/extension-telemetry
* Bump vscode engine version
* Pin extension telemetry @ 0.6.x until we can resolve #477
* Added kubectl apply right-click option and keyboard shortcut for open file
* Remove extraneous console.log in case of performance impact
* Refactoring toolkitNode
* Added loading spinners to "Loading..."
* No icons for nested namespaces
* Update node labels after refresh

# v0.25.2

* Live update for all flux types and UI fixes (#479)

# v0.25.1

* README for release (#473)
* Add a hard timeout for all processes we spawn (#460)
* Add timeout configuration to GitOps Tools preferences
* Allow users to disable running `flux check` in GitOps Tools preferences
* Now works with Loft.sh (resolving HelmRelease APIService name conflict)
* Refactor data providers to not break on context switches
* Optimizing k8s proxy connections
* Remove debug console.log
* Expand all for workloads, sources
* Namespace UI improvements
* Update github actions workflows, Kind, Kubernetes version for testing
* Responsive UI tested with oidc-login
* Kubectl api-resources controls async resource treeview loading
* Edge rebase @ 0.25.1-edge.7 (#463)

# v0.25.0

* Major enhancement: fork and exec/kubectl CLI is mostly removed from the main process flow.
  * Reactive ui with client-node and kubectl proxy (#446)
  * Closes #422 - Fork and exec is dangerous and slow
* Refactor: treeview Sources/Workloads organization and code has been majorly reorganized.
* Update dependencies (#449)
* Reconcile with Source (#444)
* Clean up Kubernetes list types (#443)
* Improve code layout and use baseUrl for imports (#442)

# v0.24.3

* Fix webview dispose bug and createSecret bug (#439)

# v0.24.2

* Fix YouTube link in README (#436)

# v0.24.1

* Update README to include VSCode Live Stream (#433)

# v0.24.0

* Add support for WGE GitOpsTemplates view and rendering (#428)
* Source and Workload views UI improvements (#430)

# v0.23.2

* Fix npm audit warnings (#425)
* Support Flux 0.40 Artifact Revision format (#424)

# v0.23.1

* .vscodeignore webview-ui sources (#420)
* Merge pull request #418 from weaveworks/release-pr

# v0.23.0

* Merge pull request #417 from kingdonb/fix-readme-svg-issue
  * SVGs are restricted in README
* Merge pull request #416 from kingdonb/node-19
  * try node 19
* Merge pull request #415 from weaveworks/edge
* Merge pull request #414 from kingdonb/fix-flux-cli
  * switch kind to existing image
  * pin-github-actions
  * move "install vcse" to earlier in the workflow
  * upgrade kind, resolve flux cli occasional failure
* release build fixes (#412)
* Rebuild README.md (#411)
* Configure gitops workflow improvements (#410)
* update README.md (#409)
* Adding Video Resources (#404)
* test: timeout kustomizations that wont reconcile (#402)
* Merge pull request #397 from weaveworks/release-pr

# v0.22.5

* update telemetry key (#395)

# v0.22.4

* Add visibility to the release process in dev docs (#394)

# v0.22.3

* createSource uses correct azure name parameter (#391)

# v0.22.2

* Release 0.22.1 again as 0.22.2 (#389)

# v0.22.1

* undo optimistic npm upgrade/mitigate git-url-parse (#388)
* upgrade git-url-parse pin (#387)
* mitigate CVEs from dependabot (#386)

# v0.22.0 - [2022-08-28]

* AKS UI and support (#384)
* Point at a stable target from tests (#381)

# v0.21.0 - [2022-08-11]

* Add OCIRepository sources support (#377)

# v0.20.11 - [2022-08-10]

* Update SECURITY.md (#374)
* Don't ping every context on startup (#363)

# v0.20.10 - [2022-08-06]

* Create SECURITY.md (#364)
* Add workflow for deleting Kustomize/HelmRelease workloads (#339)
* Config parsing fixes (#365)
* Release (#367) - Add CHANGELOG entry

# v0.20.9 - [2022-08-04]

* Minor fixes in test body (#361)
* Release (#363) - Add support for Open-VSX registry and VSCodium

# v0.20.8 - [2022-08-01]

* Proofreading in DEVELOPMENT.md (#349)
* Highlight VS Code Marketplace link for GitHub visitors (#350)
* Change the Display Name of the extension to "GitOps Tools for Flux" (#351)
* Update getting started to refer to Marketplace instead of manual install (#352)

# v0.20.7 - [2022-07-31]

* Following up (#342)[https://github.com/weaveworks/vscode-gitops-tools/pull/342]
* Release (#348) - Release Pull Request Formatting 👍

# v0.20.6 - [2022-07-31]

* Following up (#342)[https://github.com/weaveworks/vscode-gitops-tools/pull/342]
* Release (#347)

# v0.20.5 - [2022-07-31]

* Fixup release-pr body formatting (#345)
* Release (#346)

# v0.20.4 - [2022-07-31]

* Make release process slightly better documented (#342)[https://github.com/weaveworks/vscode-gitops-tools/pull/342]

# v0.20.3 - [2022-07-29]

* rename Pull Git Repository (#340)
* generic sortByMetadataName (#338)

# v0.20.2 - [2022-07-26]

* Borrow set kubeconfig command from Kubernetes Tools (#334)

# v0.20.1 - [2022-07-20]

* Dependabot: Bump terser from 5.7.1 to 5.14.2 (#331)

# v0.20.0 - [2022-07-19]

* Sort order for Workloads and Sources (#326), (#327)
* Move Reconcile ahead of Suspend in menu (#325)
* Improve docs around prerelease workflow (#323), (#321), (#310)
* Upgrade dependencies (#322)
* New user guide (#319), (#320)

# v0.19.11 - [2022-07-07]

* Fix: use selected namespace for the flux tree kustomization command (#316)

# v0.19.10 - [2022-07-01]

* Add CHANGELOG (#307)
* Add DEVELOPMENT.md, move this content out of README (#306)
* Search for FluxCD should now return the extension in the VSCode Marketplace (#305)

# v0.19.9 - [2022-07-01]

* Fix #302, parsing flux CLI output correctly from changes in Flux 0.31.2 (#303)
* Make image badges in README link to marketplace entry (#301)

# v0.19.8 - [2022-06-24]

* Try to raise our SEO profile (#298)
* add VSCode Marketplace link/badge to README (#296)
* Bump got from 11.8.2 to 11.8.5 (#297)

# v0.19.7 - [2022-06-08]

* Resolve this diff (#294)
* add some debugging helpers (#293)
* Clean up CHANGELOG (#292)

# v0.19.6 - [2022-06-08]

* #289 from juozasg/remove-logo-from-readme
* #288 from kingdonb/update-changelog

# v0.19.5 - [2022-06-08]

* #286 from kingdonb/releases-in-pr

# v0.19.4 - [2022-06-08]

* #285 from kingdonb/fixup-release-metadata

# v0.19.3 - [2022-06-08]

* #283 from kingdonb/gh-actions-auto-pr
* Set the `GITHUB_TOKEN` environment variable
* #282 from kingdonb/no-exceptions-robot
* No exceptions, robot
* #281 from kingdonb/upgrade-vscode-engine
* pre-release versions are not supported until a certain vscode engine version
* #280 from kingdonb/test-edge-script
* Add edge version supporting release machinery
* #279 from kingdonb/test-requirements
* Run test with requirements
* #278 from kingdonb/release-marketplace
* Preserve a bit of history
* Delete some of old workflow
* Fixup misused github actions workflow input
* Disable Open VSX publishing
* Set screen resolution for larger display
* Borrow release workflow from
* #277 from juozasg/fix-229-loading-dotdotdot
* query workload children in targetNamespace
* #275 from kingdonb/prereleases-automatically-marked
* pin-github-actions
* `alpha.6` - automatically mark prereleases
* #274 from kingdonb/fix-flux-v1-bug
* Fix bug querying too broadly HelmReleases
* #272 from weaveworks/remove-double-colon
* Fix "GitOps Running: :"
* #270 from weaveworks/parallelize-source-data
* parallel awaits for Sources in sourceDataProvider
* README.md:clsuter→cluster (#268)
* #263 from weaveworks/integration-tests
* Increase slightly Timeout for this test
* use kind 0.12.0
* #262 from weaveworks/integration-tests
* npm test github action
* GitOps enable/disable and treeviews tests
* test env setup and e2e test outline

# v0.19.2 - [2022-04-28]

- [#218](https://github.com/weaveworks/vscode-gitops-tools/issues/218)
Set AKS cluster as generic
- [#248](https://github.com/weaveworks/vscode-gitops-tools/issues/248)
Ensure user-selected cluster type is honored on Azure AKS/Arc for "Enable/Disable GitOps"
- [#249](https://github.com/weaveworks/vscode-gitops-tools/issues/249)
Sources which are not ready still show as Green Checks
- [#250](https://github.com/weaveworks/vscode-gitops-tools/issues/250)
Fix sources workload status
- [#241](https://github.com/weaveworks/vscode-gitops-tools/issues/241)
Fix typo in documentation
- [#247](https://github.com/weaveworks/vscode-gitops-tools/issues/247)
Fix release attribution
- [#251](https://github.com/weaveworks/vscode-gitops-tools/issues/251), [#252](https://github.com/weaveworks/vscode-gitops-tools/issues/252), [#253](https://github.com/weaveworks/vscode-gitops-tools/issues/253)
Refactoring internals

# v0.19.1 - [2022-04-11]

- [#215](https://github.com/weaveworks/vscode-gitops-tools/issues/215)
Clusters list does not refresh
- [#220](https://github.com/weaveworks/vscode-gitops-tools/issues/220)
Change references from Wego to Weave GitOps
- [#237](https://github.com/weaveworks/vscode-gitops-tools/issues/237)
Remove go-fish
- [#239](https://github.com/weaveworks/vscode-gitops-tools/issues/239)
Refresh Clusters - triggers unexpected behavior / does not do what I expected
- [#243](https://github.com/weaveworks/vscode-gitops-tools/issues/243)
Release Plan for v0.19.1 patch release

# v0.19.0 - [2022-02-03]

- [#212](https://github.com/weaveworks/vscode-gitops-tools/issues/212)
Possibly require specific request to change cluster context
- [#213](https://github.com/weaveworks/vscode-gitops-tools/issues/213)
Azure GitOps supports Bucket source now
- [#214](https://github.com/weaveworks/vscode-gitops-tools/issues/214)
For new Source in Azure GitOps allow user to set Namespace and Scope
- [#216](https://github.com/weaveworks/vscode-gitops-tools/issues/216)
Package Sprint 19 release

# v0.18.0 - [2022-01-27]

- [#179](https://github.com/weaveworks/vscode-gitops-tools/issues/179)
Dowload, compute & compare checksum when downloading Flux on Windows, delete temporary files later. Also try to use `gofish` to install Flux if it's found
- [#188](https://github.com/weaveworks/vscode-gitops-tools/issues/188)
Allow for the creation of arbitrary GitRepository Sources
- [#198](https://github.com/weaveworks/vscode-gitops-tools/issues/198)
Telemetry events - error handling data
- [#200](https://github.com/weaveworks/vscode-gitops-tools/issues/200)
Telemetry events - workload data
- [#208](https://github.com/weaveworks/vscode-gitops-tools/issues/208)
Use logo icons in the Documentation tree view
- [#209](https://github.com/weaveworks/vscode-gitops-tools/issues/209)
Update dependencies
- [#211](https://github.com/weaveworks/vscode-gitops-tools/issues/211)
Package Sprint 18 release
- [#207](https://github.com/weaveworks/vscode-gitops-tools/issues/207)
Refactor:
> - don't depend on the code from Clusters Tree View
> - use json output where possible
> - separate "Unknown" & "DetectionFailed" cluster provider
> - prevent opening of webview when cluster provider detection fails
> - wait until the webview is ready before sending a message to it
> - when creating source from webview - don't send default values
> - don't show git output in the default Output channel
> - show error welcome view instead of "No Clusters" (in case fetching cluster contexts fails)
> - do not let user press "Create Source" & "Create Workload" when GitOps is not enabled
> - run "flux check --pre" only when `flux` is installed

# v0.17.0 - [2022-01-13]

- [#179](https://github.com/weaveworks/vscode-gitops-tools/issues/179)
Auto-Install `flux` extension rather than directing to installation page
- [#187](https://github.com/weaveworks/vscode-gitops-tools/issues/187)
Add telemetry events
- [#196](https://github.com/weaveworks/vscode-gitops-tools/issues/196)
Telemetry events - General extension usage data
- [#197](https://github.com/weaveworks/vscode-gitops-tools/issues/197)
Telemetry events - Source data
- [#199](https://github.com/weaveworks/vscode-gitops-tools/issues/199)
Telemetry events - cluster data
- [#201](https://github.com/weaveworks/vscode-gitops-tools/issues/201)
Create Source webview fails to load
- [#204](https://github.com/weaveworks/vscode-gitops-tools/issues/204)
Package Sprint 17 release

# v0.16.0 - [2022-01-06]

- [#169](https://github.com/weaveworks/vscode-gitops-tools/issues/169)
Automatically use compatible algorithm for Azure DevOps Repository
- [#178](https://github.com/weaveworks/vscode-gitops-tools/issues/178)
Create a Bug/Feature Template
- [#183](https://github.com/weaveworks/vscode-gitops-tools/issues/183)
Config context name is not always same as cluster name
- [#184](https://github.com/weaveworks/vscode-gitops-tools/issues/184)
use `flux` azure extension name instead of `gitops`
- [#185](https://github.com/weaveworks/vscode-gitops-tools/issues/185)
Enable GitOps prompt message spelling fix
- [#186](https://github.com/weaveworks/vscode-gitops-tools/issues/186)
Create Source params are insufficient and incorrect
- [#187](https://github.com/weaveworks/vscode-gitops-tools/issues/187)
Add telemetry events
- [#189](https://github.com/weaveworks/vscode-gitops-tools/issues/189)
Remove reconcile icon from Sources pane header
- [#190](https://github.com/weaveworks/vscode-gitops-tools/issues/190)
Implement `flux trace` for all objects children of workloads
- [#191](https://github.com/weaveworks/vscode-gitops-tools/issues/191)
Add Azure Arc documentation to Documentation Pane
- [#192](https://github.com/weaveworks/vscode-gitops-tools/issues/192)
Default for top-level items in Documentation section to be collapsed
- [#194](https://github.com/weaveworks/vscode-gitops-tools/issues/194)
Package Sprint 16 release

# v0.15.0 - [2021-12-16]

- [#157](https://github.com/weaveworks/vscode-gitops-tools/issues/157)
Allow user to create a Kustomization from a path in local open repository (ARC)
- [#158](https://github.com/weaveworks/vscode-gitops-tools/issues/158)
Allow user to create a Kustomization from a path in local open repository (AKS)
- [#172](https://github.com/weaveworks/vscode-gitops-tools/issues/172)
Add tooltip to Workloads to describe what is included in that definition
- [#175](https://github.com/weaveworks/vscode-gitops-tools/issues/175)
Copy resource name
- [#180](https://github.com/weaveworks/vscode-gitops-tools/issues/180)
Show suspend status for Sources and Workloads
- [#181](https://github.com/weaveworks/vscode-gitops-tools/issues/181)
dependabot reported vulnerabilities
- [#182](https://github.com/weaveworks/vscode-gitops-tools/issues/182)
Package Sprint 15 release

# v0.14.0 - [2021-12-09]

- [#106](https://github.com/weaveworks/vscode-gitops-tools/issues/106)
Allow user to create a `Kustomization` from a path in local open repository (Generic cluster)
- [#160](https://github.com/weaveworks/vscode-gitops-tools/issues/160)
Detect Azure ARC using ConfigMap
- [#163](https://github.com/weaveworks/vscode-gitops-tools/issues/163)
Workload `suspend` [Generic cluster]
- [#164](https://github.com/weaveworks/vscode-gitops-tools/issues/164)
Workload `resume` [Generic clusters]
- [#167](https://github.com/weaveworks/vscode-gitops-tools/issues/167)
Use information from configmaps for Azure (resource group, cluster name, subscription id)
- [#174](https://github.com/weaveworks/vscode-gitops-tools/issues/174)
Package Sprint 14 release

# v0.13.0 - [2021-12-02]

- [#152](https://github.com/weaveworks/vscode-gitops-tools/issues/152)
Progress notifications can be annoying
- [#153](https://github.com/weaveworks/vscode-gitops-tools/issues/153)
Add loading clusters context
- [#154](https://github.com/weaveworks/vscode-gitops-tools/issues/154)
Show Logs fails on 2 controllers from AKS/ARC
- [#155](https://github.com/weaveworks/vscode-gitops-tools/issues/155)
Set cluster provider manually
- [#156](https://github.com/weaveworks/vscode-gitops-tools/issues/156)
Package Sprint 13 release

# v0.12.0 - [2021-11-25]

- [#116](https://github.com/weaveworks/vscode-gitops-tools/issues/116)
Top level workload object reconciliation status
- [#121](https://github.com/weaveworks/vscode-gitops-tools/issues/121), [#120](https://github.com/weaveworks/vscode-gitops-tools/issues/120), [#119](https://github.com/weaveworks/vscode-gitops-tools/issues/119), [#118](https://github.com/weaveworks/vscode-gitops-tools/issues/118)
Resume/Suspend Git Source Reconciliation on AKS/AKS ARC cluster
- [#125](https://github.com/weaveworks/vscode-gitops-tools/issues/125), [#126](https://github.com/weaveworks/vscode-gitops-tools/issues/126), [#128](https://github.com/weaveworks/vscode-gitops-tools/issues/128), [#129](https://github.com/weaveworks/vscode-gitops-tools/issues/129)
Add support for adding ssh cloned git repositories (public/private) (AKS/AKS ARC cluster)
- [#147](https://github.com/weaveworks/vscode-gitops-tools/issues/147)
Replace all references to Applications to Workloads
- [#150](https://github.com/weaveworks/vscode-gitops-tools/issues/150)
Disable GitOps on the AKS/ARC clusters
- [#151](https://github.com/weaveworks/vscode-gitops-tools/issues/151)
Package Sprint 12 release

# v0.11.0 - [2021-11-18]

- [#117](https://github.com/weaveworks/vscode-gitops-tools/issues/117)
Suspend Git Source Reconciliation (Generic Cluster)
- [#122](https://github.com/weaveworks/vscode-gitops-tools/issues/122)
Resume Git Source Reconciliation (Generic)
- [#124](https://github.com/weaveworks/vscode-gitops-tools/issues/124)
Add support for adding ssh cloned git repositories (public repos -Generic Cluster)
- [#127](https://github.com/weaveworks/vscode-gitops-tools/issues/127)
Add support for adding ssh cloned git repositories (private repos -Generic Cluster)
- [#139](https://github.com/weaveworks/vscode-gitops-tools/issues/139)
Commands need to wait before the cluster provider is known
- [#141](https://github.com/weaveworks/vscode-gitops-tools/issues/141)
Create output to view `kubectl` command calls
- [#142](https://github.com/weaveworks/vscode-gitops-tools/issues/142)
Update dev dependencies
- [#143](https://github.com/weaveworks/vscode-gitops-tools/issues/143)
AnyResourceNode should have basic markdown hover
- [#144](https://github.com/weaveworks/vscode-gitops-tools/issues/144)
Refactor
- [#148](https://github.com/weaveworks/vscode-gitops-tools/issues/148)
Package Sprint 11 release

# v0.10.0 - [2021-11-11]

- [#130](https://github.com/weaveworks/vscode-gitops-tools/issues/130)
Don't ask for `GitRepository` object name, use naming convention standard
- [#131](https://github.com/weaveworks/vscode-gitops-tools/issues/131)
Flux delete command requires interactive user response - request `--yes` or similar flag to be added for non-interactive execution.
- [#132](https://github.com/weaveworks/vscode-gitops-tools/issues/132)
If the current repo/branch is already added as a GitRepository, change the option from `Add git repo` to `Reconcile repository`
- [#133](https://github.com/weaveworks/vscode-gitops-tools/issues/133)
When adding a GitRepository, do not ask the user for branch, always use the branch currently checked out.
- [#135](https://github.com/weaveworks/vscode-gitops-tools/issues/135)
Git command for branch selection fails on zsh, sh
- [#136](https://github.com/weaveworks/vscode-gitops-tools/issues/136)
Ouput: add newline between commands
- [#137](https://github.com/weaveworks/vscode-gitops-tools/issues/137)
Menu to enable/disable gitops is visible too early
- [#138](https://github.com/weaveworks/vscode-gitops-tools/issues/138)
Package Sprint 10 release

# v0.9.0 - [2021-11-04]

- [#100](https://github.com/weaveworks/vscode-gitops-tools/issues/100)
Identify whether Cluster is managed by Azure ARC
- [#101](https://github.com/weaveworks/vscode-gitops-tools/issues/101)
Enable GitOps on an AKS ARC Cluster
- [#102](https://github.com/weaveworks/vscode-gitops-tools/issues/102)
Add a GitRepository source, from the current open Git Repo in VS Code to a AKS ARC Cluster
- [#103](https://github.com/weaveworks/vscode-gitops-tools/issues/103)
Add a GitRepository source, from the current open Git Repo in VS Code to a AKS Cluster
- [#104](https://github.com/weaveworks/vscode-gitops-tools/issues/104)
Add a GitRepository source, from the current open Git Repo in VS Code to a Generic Cluster
- [#105](https://github.com/weaveworks/vscode-gitops-tools/issues/105)
Allow a user to Pull a GitRepository source locally and open in VS Code
- [#114](https://github.com/weaveworks/vscode-gitops-tools/issues/114)
Use description for application created resource kind
- [#115](https://github.com/weaveworks/vscode-gitops-tools/issues/115)
Delete git repository source
- [#134](https://github.com/weaveworks/vscode-gitops-tools/issues/134)
Package Sprint 9 release

# v0.8.0 - [2021-10-21]

- [#84](https://github.com/weaveworks/vscode-gitops-tools/issues/84)
Enable GitOps on an AKS Cluster
- [#112](https://github.com/weaveworks/vscode-gitops-tools/issues/112)
Status bar loading message is stuck

# v0.7.0 - [2021-10-14]

- [#97](https://github.com/weaveworks/vscode-gitops-tools/issues/97)
Modify cluster type microcopy and only show types for identified providers
- [#98](https://github.com/weaveworks/vscode-gitops-tools/issues/98)
Spike: Investigate why load time is slow when clicking into an application
- [#99](https://github.com/weaveworks/vscode-gitops-tools/issues/99)
Clusters: Show version of flux on hover
- [#108](https://github.com/weaveworks/vscode-gitops-tools/issues/108)
Refactor commands file
- [#109](https://github.com/weaveworks/vscode-gitops-tools/issues/109)
Use --client and -o json when running flux version
- [#110](https://github.com/weaveworks/vscode-gitops-tools/issues/110)
Nest applications under namespaces.
- [#111](https://github.com/weaveworks/vscode-gitops-tools/issues/111)
After running Disable GitOps cluster context/icon is not updated
- [#113](https://github.com/weaveworks/vscode-gitops-tools/issues/113)
Package Sprint 7 release

# v0.6.0 - [2021-10-07]

- [#41](https://github.com/weaveworks/vscode-gitops-tools/issues/41)
Indicate fetch errors on sources
- [#82](https://github.com/weaveworks/vscode-gitops-tools/issues/82)
Identify whether Cluster is managed by Azure or not
- [#83](https://github.com/weaveworks/vscode-gitops-tools/issues/83)
Show first level of objects created as children of an Application of type HelmRelease
- [#87](https://github.com/weaveworks/vscode-gitops-tools/issues/87)
Add option to View controller logs on right click
- [#90](https://github.com/weaveworks/vscode-gitops-tools/issues/90)
Show output progress in notification
- [#92](https://github.com/weaveworks/vscode-gitops-tools/issues/92)
Refactor the codebase
- [#95](https://github.com/weaveworks/vscode-gitops-tools/issues/95)
Prerequsite check should use output view instead of the terminal
- [#96](https://github.com/weaveworks/vscode-gitops-tools/issues/96)
Package Sprint 6 release

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
