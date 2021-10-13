import { window } from 'vscode';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { shell } from '../shell';
import { ClusterNode } from '../views/nodes/clusterNode';
import { refreshClusterTreeView, refreshTreeViews } from '../views/treeViews';

/**
 * Install or uninstall flux from the passed or current cluster (if first argument is undefined)
 * @param clusterNode target cluster tree view item
 * @param enable Specifies if function should install or uninstall
 */
async function enableDisableGitOps(clusterNode: ClusterNode | undefined, enable: boolean) {
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
