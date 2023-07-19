import safesh from 'shell-escape-tag';

import { AzureConstants } from 'cli/azure/azureTools';
import { globalState, telemetry } from 'extension';
import { ClusterProvider } from 'types/kubernetes/clusterProvider';
import { ConfigMap, Node } from 'types/kubernetes/kubernetesTypes';
import { TelemetryError } from 'types/telemetryEventNames';
import { parseJson, parseJsonItems } from 'utils/jsonUtils';
import { getFluxControllers, notAnErrorServerNotRunning } from './kubectlGet';
import { invokeKubectlCommand } from './kubernetesToolsKubectl';
import { kubeConfig } from './kubernetesConfig';

/**
 * Try to detect known cluster providers. Returns user selected cluster type if that is set.
 * @param context target context to get resources from.
 * TODO: maybe use Errorable?
 */
export async function detectClusterProvider(contextName: string): Promise<ClusterProvider> {
	const context = kubeConfig.getContextObject(contextName)!;
	const clusterName = context.cluster || contextName;
	const clusterMetadata = globalState.getClusterMetadata(clusterName);

	if(clusterMetadata?.clusterProvider) {
		return clusterMetadata.clusterProvider;
	}

	const tryProviderAzureARC = await isClusterAzureARC(contextName);
	if (tryProviderAzureARC === ClusterProvider.AzureARC) {
		return ClusterProvider.AzureARC;
	} else if (tryProviderAzureARC === ClusterProvider.DetectionFailed) {
		return ClusterProvider.DetectionFailed;
	}

	const tryProviderAKS = await isClusterAKS(contextName);
	if (tryProviderAKS === ClusterProvider.AKS) {
		return ClusterProvider.AKS;
	} else if (tryProviderAKS === ClusterProvider.DetectionFailed) {
		return ClusterProvider.DetectionFailed;
	}

	return ClusterProvider.Generic;
}

/**
 * Try to determine if the cluster is AKS or not.
 * @param context target context to get resources from.
 */
async function isClusterAKS(context: string): Promise<ClusterProvider> {
	const nodesShellResult = await invokeKubectlCommand(safesh`get nodes --context=${context} -o json`);

	if (nodesShellResult?.code !== 0) {
		console.warn(`Failed to get nodes from "${context}" context to determine the cluster type. ${nodesShellResult?.stderr}`);
		if (nodesShellResult?.stderr && !notAnErrorServerNotRunning.test(nodesShellResult.stderr)) {
			telemetry.sendError(TelemetryError.FAILED_TO_GET_NODES_TO_DETECT_AKS_CLUSTER);
		}
		return ClusterProvider.DetectionFailed;
	}

	const nodes: Node[] = parseJsonItems(nodesShellResult.stdout);

	const firstNode = nodes[0];

	if (!firstNode) {
		console.warn(`No nodes in the "${context}" context to determine the cluster type.`);
		return ClusterProvider.DetectionFailed;
	}

	const providerID = firstNode.spec?.providerID;

	if (providerID?.startsWith('azure:///')) {
		return ClusterProvider.AKS;
	} else {
		return ClusterProvider.Generic;
	}
}

/**
 * Try to determine if the cluster is managed by Azure ARC or not.
 * @param context target context to get resources from.
 */
async function isClusterAzureARC(context: string): Promise<ClusterProvider> {
	const configmapShellResult = await invokeKubectlCommand(safesh`get configmaps azure-clusterconfig -n ${AzureConstants.ArcNamespace} --context=${context} --ignore-not-found -o json`);

	if (configmapShellResult?.code !== 0) {
		if (configmapShellResult?.stderr && !notAnErrorServerNotRunning.test(configmapShellResult.stderr)) {
			telemetry.sendError(TelemetryError.FAILED_TO_GET_CONFIGMAPS_TO_DETECT_ARC_CLUSTER);
		}
		console.warn(`Failed to get configmaps from "${context}" context to determine the cluster type. ${configmapShellResult?.stderr}`);
		return ClusterProvider.DetectionFailed;
	}

	const stdout = configmapShellResult.stdout;
	if (stdout.length) {
		const azureClusterconfigConfigMap: ConfigMap | undefined = parseJson(stdout);
		if (azureClusterconfigConfigMap === undefined) {
			return ClusterProvider.DetectionFailed;
		} else {
			return ClusterProvider.AzureARC;
		}
	}

	return ClusterProvider.Generic;
}

/**
 * Return true if gitops is enabled in the current cluster.
 * Function checks if `flux-system` namespace contains flux controllers.
 * @param contextName target cluster name
 */
export async function isGitOpsEnabled(contextName: string) {
	const fluxControllers = await getFluxControllers(contextName);

	return fluxControllers.length !== 0;
}
