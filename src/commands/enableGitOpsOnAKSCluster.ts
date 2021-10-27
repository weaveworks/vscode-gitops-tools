import { window } from 'vscode';
import { globalState } from '../globalState';
import { shell } from '../shell';
import { ClusterNode } from '../views/nodes/clusterNode';
import { refreshTreeViews } from '../views/treeViews';

/**
 * enable gitops on an AKS cluster
 * @param clusterNode target cluster node
 */
export async function enableGitOpsOnAKSCluster(clusterNode: ClusterNode) {

	const azureMetadata = globalState.getClusterMetadata(clusterNode.name);

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

	globalState.setClusterMetadata(clusterName, {
		azureResourceGroup: resourceGroup,
		azureSubscription: subscription,
	});

	const enableGitOpsQuery = `az k8s-extension-private create -g ${resourceGroup} -c ${clusterName} -t managedClusters --name gitops --extension-type microsoft.flux --scope cluster --release-train stable --subscription ${subscription}`;

	await shell.execWithOutput(enableGitOpsQuery);

	refreshTreeViews();
}
