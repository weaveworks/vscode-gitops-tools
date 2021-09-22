import {
	commands, Disposable,
	ExtensionContext,
	Uri, window,
	workspace
} from 'vscode';
import { runTerminalCommand } from './gitOps';
import { kubernetesTools } from './kubernetes/kubernetesTools';
import { KubernetesObjectKinds } from './kubernetes/kubernetesTypes';
import { HelmReleaseNode, KustomizationNode } from './views/applicationDataProvider';
import { ClusterNode } from './views/clusterDataProvider';
import { BucketNode, GitRepositoryNode, HelmRepositoryNode } from './views/sourceDataProvider';
import {
	refreshApplicationTreeView,
	refreshClusterTreeView,
	refreshSourceTreeView,
	refreshTreeViews
} from './views/treeViews';

/**
 * GitOps/vscode editor commands.
 */
export enum EditorCommands {
	OpenResource = 'gitops.editor.openResource'
}

/**
 * GitOps View commands.
 */
export enum ViewCommands {
	Open = 'vscode.open',
	SetContext = 'setContext',
	RefreshTreeViews = 'gitops.views.refreshTreeViews',
	RefreshSourceTreeView = 'gitops.views.refreshSourceTreeView',
	RefreshApplicationTreeView = 'gitops.views.refreshApplicationTreeView',
}

/**
 * Kubectl commands.
 */
export enum KubectlCommands {
	Version = 'gitops.kubectl.version',
	SetCurrentContext = 'gitops.kubectl.setCurrentContext',
}

/**
 * Flux commands.
 */
 export enum FluxCommands {
	CheckPrerequisites = 'gitops.flux.checkPrerequisites',
	EnableGitOps = 'gitops.flux.install',
	DisableGitOps = 'gitops.flux.uninstall',
	ReconcileSource = 'gitops.flux.reconcileSource',
	ReconcileApplication = 'gitops.flux.reconcileApplication',
}

/**
 * Cli executable names.
 */
export const enum TerminalCLICommands {
	Flux = 'flux',
	Kubectl = 'kubectl',
}

let _context: ExtensionContext;

/**
 * Registers GitOps extension commands.
 * @param context VSCode extension context.
 */
export function registerCommands(context: ExtensionContext) {
	_context = context;
	registerCommand(KubectlCommands.Version, showKubectlVersion);
	registerCommand(KubectlCommands.SetCurrentContext, setKubernetesClusterContext);
	registerCommand(ViewCommands.RefreshTreeViews, refreshTreeViews);
	registerCommand(ViewCommands.RefreshSourceTreeView, refreshSourceTreeView);
	registerCommand(ViewCommands.RefreshApplicationTreeView, refreshApplicationTreeView);
	registerCommand(FluxCommands.CheckPrerequisites, checkFluxPrerequisites);
	registerCommand(FluxCommands.ReconcileSource, reconcileSource);
	registerCommand(FluxCommands.ReconcileApplication, reconcileApplication);

	registerCommand(FluxCommands.EnableGitOps, (clusterTreeItem: ClusterNode) => {
		enableDisableGitOps(clusterTreeItem, true);
	});
	registerCommand(FluxCommands.DisableGitOps, (clusterTreeItem: ClusterNode) => {
		enableDisableGitOps(clusterTreeItem, false);
	});

	// add open gitops resource in vscode editor command
	context.subscriptions.push(
		commands.registerCommand(EditorCommands.OpenResource, (uri: Uri) => {
			workspace.openTextDocument(uri).then((document) => {
				if (document) {
					window.showTextDocument(document);
				}
			},
			(error) => window.showErrorMessage(`Error loading document: ${error}`));
		})
	);
}

/**
 * Registers vscode extension command.
 * @param commandName Command name.
 * @param callback Command handler.
 * @param thisArg The `this` context used when invoking the handler function.
 * @returns Disposable which unregisters this command on disposal.
 */
function registerCommand(commandName: string, callback: (...args: any[]) => any, thisArg?: any): Disposable {
	const command: Disposable = commands.registerCommand(commandName, callback);
	_context.subscriptions.push(command);
	return command;
}

/**
 * Outputs kubectl version in gitops terminal.
 */
async function showKubectlVersion() {
	runTerminalCommand(_context, TerminalCLICommands.Kubectl, 'version');
}

/**
 * Runs Flux check --pre command in gitops terminal.
 */
 async function checkFluxPrerequisites() {
	runTerminalCommand(_context, TerminalCLICommands.Flux, 'check --pre');
}

/**
 * Sets Kubernetes cluster context.
 * @param contextName Kubernetes cluster context name.
 */
export async function setKubernetesClusterContext(contextName: string) {
	const setContextResult = await kubernetesTools.setCurrentContext(contextName);
	if (setContextResult?.isChanged) {
		refreshTreeViews();
	}
}

/**
 * Install or uninstall flux from the passed cluster.
 * @param clusterTreeItem target cluster tree view item
 * @param enable Specifies if function should install or uninstall
 */
export async function enableDisableGitOps(clusterTreeItem: ClusterNode, enable: boolean) {
	// Switch current context if needed
	const setContextResult = await kubernetesTools.setCurrentContext(clusterTreeItem.name);
	if (!setContextResult) {
		window.showErrorMessage('Coundn\'t set current context');
		return;
	}
	refreshClusterTreeView();

	runTerminalCommand(_context, TerminalCLICommands.Flux, enable ? 'install' : 'uninstall');
}

/**
 * Invoke flux reconcile of a specific source.
 * @param source Target source tree view item.
 */
export async function reconcileSource(source: GitRepositoryNode | HelmRepositoryNode | BucketNode) {
	/**
	 * Accepted source names in flux: `git`, `helm`, `bucket`.
	 * Can be checked with: `flux reconcile source --help`
	 */
	const sourceType = source.resource.kind === KubernetesObjectKinds.GitRepository ? 'git' :
		source.resource.kind === KubernetesObjectKinds.HelmRepository ? 'helm' :
		source.resource.kind === KubernetesObjectKinds.Bucket ? 'bucket' :
		'unknown';
	if (sourceType === 'unknown') {
		window.showErrorMessage(`Unknown resource kind ${source.resource.kind}`);
		return;
	}

	runTerminalCommand(_context, TerminalCLICommands.Flux, `reconcile source ${sourceType} ${source.resource.metadata.name} -n ${source.resource.metadata.namespace}`);
}

/**
 * Invoke flux reconcile of a specific application.
 * @param application Target application tree view item.
 */
export async function reconcileApplication(application: KustomizationNode | HelmReleaseNode) {
	/**
	 * Accepted application names in flux: `kustomization`, `helmrelease`.
	 * Can be checked with: `flux reconcile --help`
	 */
	const applicationType = application.resource.kind === KubernetesObjectKinds.Kustomization ? 'kustomization' :
		application.resource.kind === KubernetesObjectKinds.HelmRelease ? 'helmrelease' :
		'unknown';
	if (applicationType === 'unknown') {
		window.showErrorMessage(`Unknown application kind ${application.resource.kind}`);
		return;
	}

	runTerminalCommand(_context, TerminalCLICommands.Flux, `reconcile ${applicationType} ${application.resource.metadata.name} -n ${application.resource.metadata.namespace}`);
}
