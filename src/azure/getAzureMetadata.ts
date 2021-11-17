import { window } from 'vscode';
import { globalState } from '../globalState';

/**
 * Prompt for the azure cluster:
 * 1) Resource group
 * 2) Cluster name (in azure)
 * 3) ID of the azure subscription
 * @param clusterContextName cluster name as in kubernetes context
 */
export async function getAzureMetadata(clusterContextName: string) {
	const azureMetadata = globalState.getClusterMetadata(clusterContextName);

	const resourceGroup = await window.showInputBox({
		title: 'Enter the Azure Resource group (where the cluster is)',
		ignoreFocusOut: true,
		value: azureMetadata?.azureResourceGroup ?? '',
	});

	if (!resourceGroup) {
		return;
	}

	const clusterName = await window.showInputBox({
		title: 'Enter the cluster name (as defined in Azure)',
		ignoreFocusOut: true,
		value: azureMetadata?.azureClusterName ?? '',
	});

	if (!clusterName) {
		return;
	}

	const subscription = await window.showInputBox({
		title: 'Enter the name or ID of the Azure subscription that owns the resource group',
		ignoreFocusOut: true,
		value: azureMetadata?.azureSubscription ?? '',
	});

	if (!subscription) {
		return;
	}

	globalState.setClusterMetadata(clusterContextName, {
		azureResourceGroup: resourceGroup,
		azureSubscription: subscription,
		azureClusterName: clusterName,
	});

	return {
		resourceGroup,
		subscription,
		clusterName,
	};
}
