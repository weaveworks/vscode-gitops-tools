import { window } from 'vscode';

import { azureTools, isAzureProvider } from 'cli/azure/azureTools';
import { fluxTools } from 'cli/flux/fluxTools';
import { detectClusterProvider } from 'cli/kubernetes/clusterProvider';
import { disableConfirmations, telemetry } from 'extension';
import { failed } from 'types/errorable';
import { ClusterProvider } from 'types/kubernetes/clusterProvider';
import { TelemetryEvent } from 'types/telemetryEventNames';
import { ClusterNode } from 'ui/treeviews/nodes/cluster/clusterNode';
import { getCurrentClusterInfo } from 'ui/treeviews/treeViews';
import { refreshAllTreeViewsCommand } from 'commands/refreshTreeViews';
import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';



/**
 * Install or uninstall flux from the passed or current cluster (if first argument is undefined)
 * @param clusterNode target cluster tree view item
 * @param enableGitOps Specifies if function should install or uninstall
 */
async function enableDisableGitOps(clusterNode: ClusterNode | undefined, enableGitOps: boolean) {
	let context = clusterNode?.context;
	let cluster = clusterNode?.cluster;

	const contextName = context?.name || kubeConfig.getCurrentContext();
	const clusterName = cluster?.name || kubeConfig.getCurrentCluster()?.name;

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
	refreshAllTreeViewsCommand();
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
