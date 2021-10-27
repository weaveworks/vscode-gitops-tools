import { window } from 'vscode';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { shell } from '../shell';
import { ClusterNode } from '../views/nodes/clusterNode';
import { clusterTreeViewProvider, refreshClusterTreeView } from '../views/treeViews';
import { enableGitOpsOnAKSCluster } from './enableGitOpsOnAKSCluster';

/**
 * Install or uninstall flux from the passed or current cluster (if first argument is undefined)
 * @param clusterNode target cluster tree view item
 * @param enable Specifies if function should install or uninstall
 */
async function enableDisableGitOps(clusterNode: ClusterNode | undefined, enable: boolean) {

	if (!clusterNode) {
		// was executed from the welcome view - get current cluster node
		clusterNode = clusterTreeViewProvider.getCurrentClusterNode();
	}

	// Prompt for confirmation
	const confirmButton = enable ? 'Install' : 'Uninstall';
	const confirmationMessage = `Do you want to	${enable ? 'enable' : 'disable'} gitops on the ${clusterNode?.name || 'current'} cluster?`;
	const confirm = await window.showWarningMessage(confirmationMessage, {
		modal: true,
	}, confirmButton);
	if (confirm !== confirmButton) {
		return;
	}

	if (clusterNode?.clusterProvider === ClusterProvider.AKS) {
		enableGitOpsOnAKSCluster(clusterNode);
		return;
	}

	let contextArg = '';
	if (clusterNode) {
		contextArg = `--context=${clusterNode.name}`;
	}

	await shell.execWithOutput(`flux ${enable ? 'install' : 'uninstall --silent'} ${contextArg}`);

	// Refresh now that flux is installed or uninstalled
	refreshClusterTreeView();
}

/**
 * Install flux to the passed or current cluster (if first argument is undefined)
 * @param clusterNode target cluster tree node
 */
export async function fluxEnableGitOps(clusterNode: ClusterNode | undefined) {
	return await enableDisableGitOps(clusterNode, true);
}

/**
 * Uninstall flux from the passed or current cluster (if first argument is undefined)
 * @param clusterNode target cluster tree node
 */
export async function fluxDisableGitOps(clusterNode: ClusterNode | undefined) {
	return await enableDisableGitOps(clusterNode, false);
}
