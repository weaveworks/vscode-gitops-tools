export const enum GitOpsExtensionConstants {
	ExtensionId = 'weaveworks.vscode-gitops-tools',
}

/**
 * GitOps view ids.
 */
export const enum TreeViewId {
	ClustersView = 'gitops.views.clusters',
	SourcesView = 'gitops.views.sources',
	WorkloadsView = 'gitops.views.workloads',
	TemplatesView = 'gitops.views.templates',
	DocumentationView = 'gitops.views.documentation',
}

export const enum CommandId {
	// vscode commands
	/**
	 * Opens the provided resource in the editor. Can be a text or binary file, or an http(s) URL.
	 */
	VSCodeOpen = 'vscode.open',
	VSCodeReload = 'workbench.action.reloadWindow',
	/**
	 * Set vscode context to use in keybindings/menus/welcome views
	 * @see https://code.visualstudio.com/api/references/when-clause-contexts
	 */
	VSCodeSetContext = 'setContext',

	// kubectl
	SetCurrentKubernetesContext = 'gitops.kubectl.setCurrentContext',

	// flux
	Suspend = 'gitops.suspend',
	Resume = 'gitops.resume',
	FluxCheck = 'gitops.flux.check',
	FluxCheckPrerequisites = 'gitops.flux.checkPrerequisites',
	FluxEnableGitOps = 'gitops.flux.install',
	FluxDisableGitOps = 'gitops.flux.uninstall',
	FluxReconcileSource = 'gitops.flux.reconcileSource',
	FluxReconcileRepository = 'gitops.flux.reconcileRepository',
	FluxReconcileWorkload = 'gitops.flux.reconcileWorkload',
	FluxReconcileWorkloadWithSource = 'gitops.flux.reconcileWorkloadWithSource',
	FluxTrace = 'gitops.flux.trace',

	// tree view
	SetClusterProvider = 'gitops.setClusterProvider',
	RefreshAllTreeViews = 'gitops.views.refreshAllTreeViews',
	RefreshResourcesTreeView = 'gitops.views.refreshResourcesTreeView',
	PullGitRepository = 'gitops.views.pullGitRepository',
	CreateGitRepository = 'gitops.views.createGitRepository',
	ExpandAllSources = 'gitops.views.expandAllSources',
	ExpandAllWorkloads = 'gitops.views.expandAllWorkloads',

	CreateKustomization = 'gitops.createKustomization',
	ShowWorkloadsHelpMessage = 'gitops.views.showWorkloadsHelpMessage',
	DeleteWorkload = 'gitops.views.deleteWorkload',
	DeleteSource = 'gitops.views.deleteSource',
	CopyResourceName = 'gitops.copyResourceName',
	AddSource = 'gitops.addSource',
	AddKustomization = 'gitops.addKustomization',

	// editor
	EditorOpenResource = 'gitops.editor.openResource',

	// webview
	ShowLogs = 'gitops.editor.showLogs',
	ShowNewUserGuide = 'gitops.views.showNewUserGuide',

	// output commands
	ShowOutputChannel = 'gitops.output.show',

	// others
	ShowInstalledVersions = 'gitops.showInstalledVersions',
	InstallFluxCli = 'gitops.installFluxCli',
	ShowGlobalState = 'gitops.dev.showGlobalState',
	CreateFromTemplate = 'gitops.views.createFromTemplate',
}


/**
 * GitOps context types.
 */
export const enum ContextId {
	CurrentClusterGitOpsNotEnabled = 'gitops:currentClusterGitOpsNotEnabled',

	IsDev = 'gitops:isDev',
	IsWGE = 'gitops:isWGE',
}
