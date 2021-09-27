import {
	commands, Disposable,
	ExtensionContext,
	Uri, window,
	workspace
} from 'vscode';
import { runTerminalCommand } from './terminal';
import { kubernetesTools } from './kubernetes/kubernetesTools';
import { KubernetesObjectKinds } from './kubernetes/kubernetesTypes';
import { shell } from './shell';
import { BucketNode } from './views/nodes/bucketNode';
import { ClusterNode } from './views/nodes/clusterNode';
import { GitRepositoryNode } from './views/nodes/gitRepositoryNode';
import { HelmReleaseNode } from './views/nodes/helmReleaseNode';
import { HelmRepositoryNode } from './views/nodes/helmRepositoryNode';
import { KustomizationNode } from './views/nodes/kustomizationNode';
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
  Check = 'gitops.flux.check',
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
	registerCommand(FluxCommands.Check, checkFlux);
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
 * Runs `flux check` command for selected cluster in gitops terminal.
 */
async function checkFlux(clusterNode: ClusterNode) {
	runTerminalCommand(_context, TerminalCLICommands.Flux, `check --context ${clusterNode.name}`);
}

/**
 * Runs `flux check --pre` command in gitops terminal.
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

	// Refresh if context was changed
	if (setContextResult.isChanged) {
		refreshClusterTreeView();
	}

	// Prompt for confirmation when uninstalling
	if (!enable) {
		const confirmButton = 'Uninstall';
		const confirm = await window.showWarningMessage(`Do you want to uninstall flux from "${clusterTreeItem.name}" cluster?`, {
			modal: true,
		}, confirmButton);
		if (confirm !== confirmButton) {
			return;
		}
	}

	await shell.execWithOutput(`${TerminalCLICommands.Flux} ${enable ? 'install' : 'uninstall --silent'}`);

	// Refresh now that flux is installed or uninstalled
	setTimeout(() => {
		refreshClusterTreeView();
	}, 3000);
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
