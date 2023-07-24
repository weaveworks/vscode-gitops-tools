import safesh from 'shell-escape-tag';
import { QuickPickItem, window } from 'vscode';

import { invokeKubectlCommand } from 'cli/kubernetes/kubernetesToolsKubectl';
import { ShellResult, shell } from 'cli/shell/exec';
import { ClusterProvider } from 'types/kubernetes/clusterProvider';
import { ConfigMap } from 'types/kubernetes/kubernetesTypes';
import { parseJson } from 'utils/jsonUtils';
import { AzureClusterProvider, AzureConstants } from './azureTools';
import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';

export interface AzureMetadata {
	resourceGroup: string;
	resourceName: string;
	subscriptionId: string;
}

function parseAzureMetadatas(subscriptionId: string, azCliResult: string): AzureMetadata[] {
	const aksClusters = parseJson(azCliResult);

	const metadatas = [];
	for(const cluster of aksClusters) {
		const parsedMetadata = {
			subscriptionId: subscriptionId,
			resourceGroup: cluster.resourceGroup,
			resourceName: cluster.name,
		};

		metadatas.push(parsedMetadata);
	}

	return metadatas;
}

async function confirmMetadataSelection(metadata: AzureMetadata, allMetadatas: AzureMetadata[]): Promise<AzureMetadata | undefined> {
	const message = `Is this the correct AKS cluster: ${metadata.resourceGroup}/${metadata.resourceName} (subscriptionId=${metadata.subscriptionId})?`;
	switch (await window.showInformationMessage(message, 'Yes', 'Select AKS Cluster...', 'Cancel')) {
		case 'Yes':
			return metadata;
		case 'Select AKS Cluster...':
			return await askUserForAzureMetadata(metadata.subscriptionId, allMetadatas);
		default:
			return undefined;
	}
}


/**
 * Get azure data from the configmaps, cluster list, or user input
 * @param clusterNode target cluster node
 * @param clusterProvider target cluster provider
 */
export async function getAzureMetadata(contextName: string, clusterProvider: AzureClusterProvider): Promise<AzureMetadata | undefined>  {
	let metadata = await getAzureConfigMapMetadata(contextName, clusterProvider);

	if(metadata) {
		return metadata;
	}

	const context = kubeConfig.getContextObject(contextName)!;
	const clusterName = context.cluster || contextName;
	return await getAzCliOrUserMetadata(clusterName);
}

/**
 * Try to lookup clusterName with the `az` CLI.
 * Use whatever information was found to ask then user to select or input the metadata.
 * @param clusterName
 * @returns Metadata from `az aks list` or from user input
 */
export async function getAzCliOrUserMetadata(clusterName: string): Promise<AzureMetadata | undefined>  {
	const [accountResult, aksResult] = await Promise.all([
		shell.execWithOutput('az account show'),
		shell.execWithOutput('az aks list'),
	]);

	const subscriptionId = parseJson(accountResult.stdout)?.id;

	// unknown subscriptionsId
	if(!subscriptionId || subscriptionId === '') {
		return await askUserForAzureMetadata(undefined, []);
	}

	// select all AKS clusters with the same clusterName
	const allMetadatas = parseAzureMetadatas(subscriptionId, aksResult.stdout);

	const matchingMetadatas: AzureMetadata[] = [];
	for(const metadata of allMetadatas) {
		if(metadata.resourceName === clusterName) {
			matchingMetadatas.push(metadata);
		}
	}


	// possible exact match
	if (matchingMetadatas.length === 1) {
		return await confirmMetadataSelection(matchingMetadatas[0], allMetadatas);
	}

	// zero, or more than one match
	return await askUserForAzureMetadata(subscriptionId, allMetadatas);
}


/**
 * Prompt for the azure cluster:
 * 1) Resource group
 * 2) Resource name (cluster name)
 * 3) ID of the azure subscription
 * @param clusterName cluster name as in kubernetes config
 */
export async function askUserForAzureMetadata(
	subscriptionId: string | undefined,
	subscriptionMetadatas: AzureMetadata[]):
	Promise<AzureMetadata | undefined> {


	// input subscriptionId
	const userSubscriptionId = await window.showInputBox({
		title: 'Enter ID of Azure subscription that owns this cluster',
		ignoreFocusOut: true,
		value: subscriptionId ?? '',
	});

	if (!userSubscriptionId) {
		return;
	}

	// refresh metadatas if a different subscription was chosen
	if(userSubscriptionId !== subscriptionId) {
		const aksResult = await shell.execWithOutput(`az aks list --subscription ${userSubscriptionId}`);
		subscriptionMetadatas = parseAzureMetadatas(userSubscriptionId, aksResult.stdout);
	}

	const items: QuickPickItem[] = subscriptionMetadatas.map(md => ({
		label: md.resourceName,
		detail: md.resourceGroup,
	}));


	const selectedItem = await window.showQuickPick(items, {
		title: 'Select your AKS cluster',
		ignoreFocusOut: true,
	});

	if(!selectedItem) {
		return undefined;
	}

	const metadata: AzureMetadata = {
		subscriptionId: userSubscriptionId,
		resourceName: selectedItem.label,
		resourceGroup: selectedItem.detail ?? '',
	};

	return await confirmMetadataSelection(metadata, subscriptionMetadatas);
}


/**
 * Get azure data from the configmaps that are created after microsoft.flux cluster extension is installed
 * @param clusterNode target cluster node
 * @param clusterProvider target cluster provider
 */
export async function getAzureConfigMapMetadata(contextName: string, clusterProvider: AzureClusterProvider): Promise<AzureMetadata | undefined>  {
	let configMapShellResult: ShellResult | undefined;
	if (clusterProvider === ClusterProvider.AKS) {
		configMapShellResult = await invokeKubectlCommand(safesh`get configmaps extension-manager-config -n ${AzureConstants.KubeSystemNamespace} --context=${contextName} --ignore-not-found -o json`);
	} else {
		configMapShellResult = await invokeKubectlCommand(safesh`get configmaps azure-clusterconfig -n ${AzureConstants.ArcNamespace} --context=${contextName} --ignore-not-found -o json`);
	}

	// the configmap does not exist, or something else went wrong
	if(!configMapShellResult || configMapShellResult.code !== 0 || configMapShellResult.stdout === '') {
		return;
	}


	const configMap: ConfigMap | undefined = parseJson(configMapShellResult.stdout);
	if (configMap === undefined) {
		return;
	}

	const result = {
		resourceGroup: configMap.data['AZURE_RESOURCE_GROUP'],
		resourceName: configMap.data['AZURE_RESOURCE_NAME'],
		subscriptionId: configMap.data['AZURE_SUBSCRIPTION_ID'],
	};

	if (!result.resourceGroup || !result.resourceName || !result.subscriptionId) {
		return;
	}

	return result;
}
