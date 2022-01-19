import { window } from 'vscode';
import { azureTools, isAzureProvider } from '../azure/azureTools';
import { telemetry } from '../extension';
import { fluxTools } from '../flux/fluxTools';
import { checkIfOpenedFolderGitRepositorySourceExists } from '../git/checkIfOpenedFolderGitRepositorySourceExists';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { TelemetryEventNames } from '../telemetry';
import { ClusterContextNode } from '../views/nodes/clusterContextNode';
import { getCurrentClusterInfo, refreshAllTreeViews } from '../views/treeViews';

/**
 * Install or uninstall flux from the passed or current cluster (if first argument is undefined)
 * @param clusterNode target cluster tree view item
 * @param enableGitOps Specifies if function should install or uninstall
 */
async function enableDisableGitOps(clusterNode: ClusterContextNode | undefined, enableGitOps: boolean) {

	if (!clusterNode) {
		// was executed from the welcome view - get current cluster node
		const currentClusterInfo = await getCurrentClusterInfo();
		if (!currentClusterInfo) {
		  return;
		}

		clusterNode = currentClusterInfo.clusterNode;
	}

	const clusterProvider = await clusterNode.getClusterProvider();
	if (clusterProvider === ClusterProvider.Unknown) {
		return;
	}

	const enableGitOpsButton = enableGitOps ? 'Enable' : 'Disable';
	const confirmationMessage = `Do you want to ${enableGitOps ? 'enable' : 'disable'} GitOps on the "${clusterNode.clusterName}" cluster?`;
	const confirm = await window.showWarningMessage(confirmationMessage, {
		modal: true,
	}, enableGitOpsButton);
	if (confirm !== enableGitOpsButton) {
		return;
	}

	if (enableGitOps) {
		telemetry.send(TelemetryEventNames.EnableGitOps, {
			clusterProvider,
		});
	} else {
		telemetry.send(TelemetryEventNames.DisableGitOps, {
			clusterProvider,
		});
	}

	if (isAzureProvider(clusterProvider)) {
		// AKS/AKS ARC cluster
		if (enableGitOps) {
			await azureTools.enableGitOps(clusterNode, clusterProvider);
		} else {
			await azureTools.disableGitOps(clusterNode, clusterProvider);
		}
	} else {
		// generic cluster
		const context = clusterNode.contextName;
		if (enableGitOps) {
			await fluxTools.install(context);
		} else {
			await fluxTools.uninstall(context);
		}
	}

	if (!enableGitOps) {
		checkIfOpenedFolderGitRepositorySourceExists();
	}

	// Refresh now that flux is installed or uninstalled
	refreshAllTreeViews();
}

/**
 * Install flux to the passed or current cluster (if first argument is undefined)
 * @param clusterNode target cluster tree node
 */
export async function fluxEnableGitOps(clusterNode: ClusterContextNode | undefined) {
	return await enableDisableGitOps(clusterNode, true);
}

/**
 * Uninstall flux from the passed or current cluster (if first argument is undefined)
 * @param clusterNode target cluster tree node
 */
export async function fluxDisableGitOps(clusterNode: ClusterContextNode | undefined) {
	return await enableDisableGitOps(clusterNode, false);
}
