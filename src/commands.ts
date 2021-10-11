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
 * GitOps/vscode editor commands.
 * TODO: list all commands under a single const enum
 */
export const enum EditorCommands {
	OpenResource = 'gitops.editor.openResource',
	ShowLogs = 'gitops.editor.showLogs',
}

export const enum OutputCommands {
	ShowOutputChannel = 'gitops.output.show',
}

/**
 * GitOps View commands.
 */
export const enum ViewCommands {
	Open = 'vscode.open',
	SetContext = 'setContext',
	RefreshTreeViews = 'gitops.views.refreshTreeViews',
	RefreshSourceTreeView = 'gitops.views.refreshSourceTreeView',
	RefreshApplicationTreeView = 'gitops.views.refreshApplicationTreeView',
	PullGitRepository = 'gitops.views.pullGitRepository',
}

/**
 * Kubectl commands.
 */
export const enum KubectlCommands {
	Version = 'gitops.kubectl.version',
	SetCurrentContext = 'gitops.kubectl.setCurrentContext',
}

/**
 * Flux commands.
 */
export const enum FluxCommands {
	Check = 'gitops.flux.check',
	CheckPrerequisites = 'gitops.flux.checkPrerequisites',
	EnableGitOps = 'gitops.flux.install',
	DisableGitOps = 'gitops.flux.uninstall',
	ReconcileSource = 'gitops.flux.reconcileSource',
	ReconcileApplication = 'gitops.flux.reconcileApplication',
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
	registerCommand(ViewCommands.PullGitRepository, pullGitRepository);
	registerCommand(FluxCommands.Check, checkFlux);
	registerCommand(FluxCommands.CheckPrerequisites, checkFluxPrerequisites);
	registerCommand(FluxCommands.ReconcileSource, reconcileSource);
	registerCommand(FluxCommands.ReconcileApplication, reconcileApplication);
	registerCommand(OutputCommands.ShowOutputChannel, showOutputChannel);

	registerCommand(FluxCommands.EnableGitOps, (clusterTreeItem: ClusterNode) => {
		enableDisableGitOps(clusterTreeItem, true);
	});
	registerCommand(FluxCommands.DisableGitOps, (clusterTreeItem: ClusterNode) => {
		enableDisableGitOps(clusterTreeItem, false);
	});

	// show logs in the editor webview (running Kubernetes extension command)
	registerCommand(EditorCommands.ShowLogs, async (deploymentNode: ClusterDeploymentNode) => {

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
	registerCommand(EditorCommands.OpenResource, (uri: Uri) => {
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
