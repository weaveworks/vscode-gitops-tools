import { V1ObjectMeta } from '@kubernetes/client-node';
import { commands, Disposable, ExtensionContext, Uri, window, workspace } from 'vscode';
import { pullGitRepository } from './commands/pullGitRepository';
import { allKinds, ResourceKind } from './kuberesources';
import { kubernetesTools } from './kubernetes/kubernetesTools';
import { ClusterProvider, KubernetesObjectKinds } from './kubernetes/kubernetesTypes';
import { showOutputChannel } from './output';
import { shell } from './shell';
import { BucketNode } from './views/nodes/bucketNode';
import { ClusterDeploymentNode } from './views/nodes/clusterDeploymentNode';
import { ClusterNode } from './views/nodes/clusterNode';
import { GitRepositoryNode } from './views/nodes/gitRepositoryNode';
import { HelmReleaseNode } from './views/nodes/helmReleaseNode';
import { HelmRepositoryNode } from './views/nodes/helmRepositoryNode';
import { KustomizationNode } from './views/nodes/kustomizationNode';
import { refreshApplicationTreeView, refreshClusterTreeView, refreshSourceTreeView, refreshTreeViews } from './views/treeViews';

/**
 * Command ids registered by this extension
 * or default vscode commands.
 */
export const enum CommandId {
	// vscode commands
	/**
	 * Opens the provided resource in the editor. Can be a text or binary file, or an http(s) URL.
	 */
	VSCodeOpen = 'vscode.open',
	/**
	 * Set vscode context to use in keybindings/menus/welcome views
	 * @see https://code.visualstudio.com/api/references/when-clause-contexts
	 */
	VSCodeSetContext = 'setContext',

	// view commands
	RefreshTreeViews = 'gitops.views.refreshTreeViews',
	RefreshSourcesTreeView = 'gitops.views.refreshSourceTreeView',
	RefreshApplicationsTreeView = 'gitops.views.refreshApplicationTreeView',
	PullGitRepository = 'gitops.views.pullGitRepository',

	// editor commands
	EditorOpenResource = 'gitops.editor.openResource',
	EditorShowLogs = 'gitops.editor.showLogs',

	// output commands
	ShowOutputChannel = 'gitops.output.show',

	// kubectl commands
	KubectlVersion = 'gitops.kubectl.version',
	SetCurrentKubernetesContext = 'gitops.kubectl.setCurrentContext',

	// flux commands
	FluxCheck = 'gitops.flux.check',
	FluxCheckPrerequisites = 'gitops.flux.checkPrerequisites',
	FluxEnableGitOps = 'gitops.flux.install',
	FluxDisableGitOps = 'gitops.flux.uninstall',
	FluxReconcileSource = 'gitops.flux.reconcileSource',
	FluxReconcileApplication = 'gitops.flux.reconcileApplication',
}

let _context: ExtensionContext;

/**
 * Registers GitOps extension commands.
 * @param context VSCode extension context.
 */
export function registerCommands(context: ExtensionContext) {
	_context = context;
	registerCommand(CommandId.KubectlVersion, showKubectlVersion);
	registerCommand(CommandId.SetCurrentKubernetesContext, setKubernetesClusterContext);
	registerCommand(CommandId.RefreshTreeViews, refreshTreeViews);
	registerCommand(CommandId.RefreshSourcesTreeView, refreshSourceTreeView);
	registerCommand(CommandId.RefreshApplicationsTreeView, refreshApplicationTreeView);
	registerCommand(CommandId.PullGitRepository, pullGitRepository);
	registerCommand(CommandId.FluxCheck, checkFlux);
	registerCommand(CommandId.FluxCheckPrerequisites, checkFluxPrerequisites);
	registerCommand(CommandId.FluxReconcileSource, reconcileSource);
	registerCommand(CommandId.FluxReconcileApplication, reconcileApplication);
	registerCommand(CommandId.ShowOutputChannel, showOutputChannel);

	registerCommand(CommandId.FluxEnableGitOps, (clusterTreeItem: ClusterNode) => {
		enableDisableGitOps(clusterTreeItem, true);
	});
	registerCommand(CommandId.FluxDisableGitOps, (clusterTreeItem: ClusterNode) => {
		enableDisableGitOps(clusterTreeItem, false);
	});

	// show logs in the editor webview (running Kubernetes extension command)
	registerCommand(CommandId.EditorShowLogs, async (deploymentNode: ClusterDeploymentNode) => {

		interface ResourceNode {
			readonly nodeType: 'resource';
			readonly name?: string;
			readonly namespace?: string;
			readonly kindName: string;
			readonly metadata: V1ObjectMeta;
			readonly kind: ResourceKind;
			uri(outputFormat: string): Uri;
		}

		const pods = await kubernetesTools.getPods(deploymentNode.resource.metadata.name, deploymentNode.resource.metadata.namespace);
		const pod = pods?.items[0];

		if (!pod) {
			window.showErrorMessage(`No pods were found from ${deploymentNode.resource.metadata.name} deployment.`);
			return;
		}

		const podResourceNode: ResourceNode = {
			nodeType: 'resource',
			name: pod.metadata.name,
			namespace: pod.metadata.namespace,
			metadata: pod.metadata,
			kindName: `pod/${pod.metadata.name}`,
			kind: allKinds.pod,
			uri(outputFormat: string) {
				return kubernetesTools.getResourceUri(this.namespace, this.kindName, outputFormat);
			},
		};

		commands.executeCommand('extension.vsKubernetesLogs', podResourceNode);
	});

	// add open gitops resource in vscode editor command
	registerCommand(CommandId.EditorOpenResource, (uri: Uri) => {
		workspace.openTextDocument(uri).then(document => {
			if (document) {
				window.showTextDocument(document);
			}
		},
		error => window.showErrorMessage(`Error loading document: ${error}`));
	});
}

/**
 * Registers vscode extension command.
 * @param commandId Command identifier.
 * @param callback Command handler.
 * @param thisArg The `this` context used when invoking the handler function.
 * @returns Disposable which unregisters this command on disposal.
 */
function registerCommand(commandId: string, callback: (...args: any[])=> any, thisArg?: any): Disposable {
	const command: Disposable = commands.registerCommand(commandId, (...args) => {
		// Show error in console when it happens in any of the commands registered by this extension.
		// By default VSCode only shows that "Error running command <command>" but not its text.
		let commandResult;
		try {
			commandResult = callback(...args);
		} catch(e) {
			console.error(e);
		}
		return commandResult;
	}, thisArg);
	_context.subscriptions.push(command);
	return command;
}

/**
 * Outputs kubectl version in gitops terminal.
 */
async function showKubectlVersion() {
	shell.execWithOutput('kubectl version');
}

/**
 * Runs `flux check` command for selected cluster in gitops terminal.
 */
async function checkFlux(clusterNode: ClusterNode) {
	shell.execWithOutput(`flux check --context ${clusterNode.name}`);
}

/**
 * Runs `flux check --pre` command in gitops terminal.
 */
async function checkFluxPrerequisites() {
	shell.execWithOutput('flux check --pre');
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
 * Install or uninstall flux from the passed or current cluster (if first argument is undefined)
 * @param clusterNode target cluster tree view item
 * @param enable Specifies if function should install or uninstall
 */
export async function enableDisableGitOps(clusterNode: ClusterNode | undefined, enable: boolean) {
	if (clusterNode) {
		// Command was called from context menu (clusterNode is defined)

		// Switch current context if needed
		const setContextResult = await kubernetesTools.setCurrentContext(clusterNode.name);
		if (!setContextResult) {
			window.showErrorMessage('Coundn\'t set current context');
			return;
		}

		// Refresh all tree views if context was changed
		if (setContextResult.isChanged) {
			refreshTreeViews();
		}
	}

	// Prompt for confirmation
	const confirmButton = enable ? 'Install' : 'Uninstall';
	const confirmationMessage = `Do you want to	${enable ? 'install' : 'uninstall'} flux ${enable ? 'to' : 'from'} ${clusterNode?.name || 'current'} cluster? (${clusterNode?.clusterProvider === ClusterProvider.AKS ? 'AKS cluster' : 'Generic cluster'})`;
	const confirm = await window.showWarningMessage(confirmationMessage, {
		modal: true,
	}, confirmButton);
	if (confirm !== confirmButton) {
		return;
	}

	let contextArg = '';
	if (clusterNode) {
		contextArg = `--context=${clusterNode.name}`;
	}
	await shell.execWithOutput(`flux ${enable ? 'install' : 'uninstall --silent'} ${contextArg}`);

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
			source.resource.kind === KubernetesObjectKinds.Bucket ? 'bucket' : 'unknown';
	if (sourceType === 'unknown') {
		window.showErrorMessage(`Unknown resource kind ${source.resource.kind}`);
		return;
	}

	await shell.execWithOutput(`flux reconcile source ${sourceType} ${source.resource.metadata.name} -n ${source.resource.metadata.namespace}`);

	refreshSourceTreeView();
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
		application.resource.kind === KubernetesObjectKinds.HelmRelease ? 'helmrelease' : 'unknown';
	if (applicationType === 'unknown') {
		window.showErrorMessage(`Unknown application kind ${application.resource.kind}`);
		return;
	}

	await shell.execWithOutput(`flux reconcile ${applicationType} ${application.resource.metadata.name} -n ${application.resource.metadata.namespace}`);

	refreshApplicationTreeView();
}

// TODO: move commands to separate files
