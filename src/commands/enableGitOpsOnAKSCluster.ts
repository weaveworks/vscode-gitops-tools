import { getAzureMetadata } from '../getAzureMetadata';
import { shell } from '../shell';
import { ClusterNode } from '../views/nodes/clusterNode';
import { refreshTreeViews } from '../views/treeViews';

/**
 * enable gitops on an AKS cluster
 * @param clusterNode target cluster node
 */
export async function enableGitOpsOnAKSCluster(clusterNode: ClusterNode, { isAzureARC }: { isAzureARC: boolean; }) {

	const azureMetadata = await getAzureMetadata(clusterNode.name);
	if (!azureMetadata) {
		return;
	}

	let enableGitOpsQuery = '';

	if (isAzureARC) {
		enableGitOpsQuery = `az k8s-extension-private create -g ${azureMetadata.azureResourceGroup} -c ${azureMetadata.azureClusterName} -t connectedClusters --name gitops --extension-type microsoft.flux --scope cluster --release-train stable --subscription ${azureMetadata.azureSubscription}`;
	} else {
		enableGitOpsQuery = `az k8s-extension-private create -g ${azureMetadata.azureResourceGroup} -c ${azureMetadata.azureClusterName} -t managedClusters --name gitops --extension-type microsoft.flux --scope cluster --release-train stable --subscription ${azureMetadata.azureSubscription}`;
	}

	await shell.execWithOutput(enableGitOpsQuery);

	refreshTreeViews();
}
