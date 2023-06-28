import { window } from 'vscode';

import { azureTools, isAzureProvider } from 'cli/azure/azureTools';
import { fluxTools } from 'cli/flux/fluxTools';
import { detectClusterProvider } from 'cli/kubernetes/clusterProvider';
import { disableConfirmations, telemetry } from 'extension';
import { failed } from 'types/errorable';
import { ClusterProvider } from 'types/kubernetes/clusterProvider';
import { TelemetryEvent } from 'types/telemetryEventNames';
import { ClusterContextNode } from 'ui/treeviews/nodes/clusterContextNode';
import { getCurrentClusterInfo, refreshAllTreeViews } from 'ui/treeviews/treeViews';



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

	const clusterProvider = await detectClusterProvider(contextName);

	if (clusterProvider === ClusterProvider.Unknown) {
		window.showErrorMessage('Cluster provider not detected yet.');
		return;
	} else if (clusterProvider === ClusterProvider.DetectionFailed) {
		window.showErrorMessage('Cluster provider detection failed.');
		return;
	}

	if(!disableConfirmations && !enableGitOps ) {
		const confirm = await window.showWarningMessage(`Do you want to disable GitOps on the "${clusterName}" cluster?`, {
			modal: true,
		}, 'Disable');
		if (confirm !== 'Disable') {
			return;
		}
	}

	if (enableGitOps) {
		telemetry.send(TelemetryEvent.EnableGitOps, {
			clusterProvider,
		});
	} else {
		telemetry.send(TelemetryEvent.DisableGitOps, {
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
