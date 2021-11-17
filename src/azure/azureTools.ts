import { getAzureMetadata } from './getAzureMetadata';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { shell } from '../shell';
import { ClusterNode } from '../views/nodes/clusterNode';

class AzureTools {

	/**
	 * Use appropriate cluster type for the `--cluster-type` flag (`-t` short?)
	 * @param clusterProvider target cluster provider
	 */
	private useClusterType(clusterProvider: ClusterProvider): string {
		return clusterProvider === ClusterProvider.AKS ? 'managedClusters' : 'connectedClusters';
	}

	/**
	 * Enable GitOps on the AKS/AKS ARC cluster.
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 */
	async enableGitOps(clusterNode: ClusterNode, clusterProvider: ClusterProvider) {

		const azureMetadata = await getAzureMetadata(clusterNode.name);
		if (!azureMetadata) {
			return;
		}

		await shell.execWithOutput(`az k8s-extension-private create -g ${azureMetadata.resourceGroup} -c ${azureMetadata.clusterName} -t ${this.useClusterType(clusterProvider)} --name gitops --extension-type microsoft.flux --scope cluster --release-train stable --subscription ${azureMetadata.subscription}`);
	}
}

/**
 * Helper methods for running `az` commands.
 */
export const azureTools = new AzureTools();
