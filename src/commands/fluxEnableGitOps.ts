import { window } from 'vscode';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { shell } from '../shell';
import { ClusterNode } from '../views/nodes/clusterNode';
import { refreshClusterTreeView } from '../views/treeViews';

/**
 * Install or uninstall flux from the passed or current cluster (if first argument is undefined)
 * @param clusterNode target cluster tree view item
 * @param enable Specifies if function should install or uninstall
 */
async function enableDisableGitOps(clusterNode: ClusterNode | undefined, enable: boolean) {

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
