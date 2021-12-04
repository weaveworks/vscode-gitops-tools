import { window } from 'vscode';
import { globalState } from '../globalState';

export interface AzureMetadata {
	resourceGroup: string;
	resourceName: string;
	subscriptionId: string;
}

/**
 * Prompt for the azure cluster:
 * 1) Resource group
 * 2) Resource name
 * 3) ID of the azure subscription
 * @param clusterContextName cluster name as in kubernetes context
 */
export async function askUserForAzureMetadata(clusterContextName: string): Promise<AzureMetadata | undefined> {
	const azureMetadata = globalState.getClusterMetadata(clusterContextName);

	const resourceGroup = await window.showInputBox({
		title: 'Enter the Azure Resource Group (where the cluster is)',
		ignoreFocusOut: true,
		value: azureMetadata?.azureResourceGroup ?? '',
	});

	if (!resourceGroup) {
		return;
	}

	const resourceName = await window.showInputBox({
		title: 'Enter the Resource Name',
		ignoreFocusOut: true,
		value: azureMetadata?.azureClusterName ?? '',
	});

	if (!resourceName) {
		return;
	}

	const subscriptionId = await window.showInputBox({
		title: 'Enter ID of Azure subscription that owns the resource group',
		ignoreFocusOut: true,
		value: azureMetadata?.azureSubscription ?? '',
	});

	if (!subscriptionId) {
		return;
	}

	globalState.setClusterMetadata(clusterContextName, {
		azureResourceGroup: resourceGroup,
		azureSubscription: subscriptionId,
		azureClusterName: resourceName,
	});

	return {
		resourceGroup,
		subscriptionId,
		resourceName,
	};
}
