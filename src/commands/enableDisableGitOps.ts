import { window } from 'vscode';
import { azureTools, isAzureProvider } from '../azure/azureTools';
import { failed } from '../errorable';
import { telemetry } from '../extension';
import { fluxTools } from '../flux/fluxTools';
import { checkIfOpenedFolderGitRepositorySourceExists } from '../git/checkIfOpenedFolderGitRepositorySourceExists';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
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

	let contextName = clusterNode?.contextName || '';
	let clusterName = clusterNode?.clusterName || '';

	if (!clusterNode) {
		// was executed from the welcome view - get current context
		const currentClusterInfo = await getCurrentClusterInfo();
		if (failed(currentClusterInfo)) {
		  return;
		}

		contextName = currentClusterInfo.result.contextName;
		clusterName = currentClusterInfo.result.clusterName;
	}

	const clusterProvider = await kubernetesTools.detectClusterProvider(contextName);

	if (clusterProvider === ClusterProvider.Unknown) {
		window.showErrorMessage('Cluster provider not detected yet.');
		return;
	} else if (clusterProvider === ClusterProvider.DetectionFailed) {
		window.showErrorMessage('Cluster provider detection failed.');
		return;
	}

	const enableGitOpsButton = enableGitOps ? 'Enable' : 'Disable';
	const confirmationMessage = `Do you want to ${enableGitOps ? 'enable' : 'disable'} GitOps on the "${clusterName}" cluster?`;
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
		if (enableGitOps) {
			await azureTools.enableGitOps(contextName, clusterProvider);
		} else {
			await azureTools.disableGitOps(contextName, clusterProvider);
		}
	} else {
		// generic cluster
		if (enableGitOps) {
			await fluxTools.install(contextName);
		} else {
			await fluxTools.uninstall(contextName);
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
