import { window } from 'vscode';
import { azureTools } from '../azure/azureTools';
import { fluxTools } from '../flux/fluxTools';
import { checkIfOpenedFolderGitRepositorySourceExists } from '../git/checkIfOpenedFolderGitRepositorySourceExists';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { ClusterNode } from '../views/nodes/clusterNode';
import { getCurrentClusterNode, refreshAllTreeViews } from '../views/treeViews';

/**
 * Install or uninstall flux from the passed or current cluster (if first argument is undefined)
 * @param clusterNode target cluster tree view item
 * @param enable Specifies if function should install or uninstall
 */
async function enableDisableGitOps(clusterNode: ClusterNode | undefined, enable: boolean) {

	if (!clusterNode) {
		// was executed from the welcome view - get current cluster node
		clusterNode = getCurrentClusterNode();
		if (!clusterNode) {
			return;
		}
	}

	const clusterProvider = await clusterNode.getClusterProvider();
	if (clusterProvider === ClusterProvider.Unknown) {
		return;
	}

	const confirmButton = enable ? 'Enable' : 'Disable';
	const confirmationMessage = `Do you want to	${enable ? 'enable' : 'disable'} GitOps on the "${clusterNode.name}" cluster?`;
	const confirm = await window.showWarningMessage(confirmationMessage, {
		modal: true,
	}, confirmButton);
	if (confirm !== confirmButton) {
		return;
	}

	if (clusterProvider === ClusterProvider.AKS ||
		clusterProvider === ClusterProvider.AzureARC) {
		// AKS/AKS ARC cluster
		if (enable) {
			await azureTools.enableGitOps(clusterNode, clusterProvider);
		} else {
			await azureTools.disableGitOps(clusterNode, clusterProvider);
			checkIfOpenedFolderGitRepositorySourceExists();
		}
	} else {
		// generic cluster
		const context = clusterNode.name;
		if (enable) {
			await fluxTools.install(context);
		} else {
			await fluxTools.uninstall(context);
		}
	}

	// Refresh now that flux is installed or uninstalled
	refreshAllTreeViews();
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
