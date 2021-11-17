import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { shell } from '../shell';
import { ClusterNode } from '../views/nodes/clusterNode';
import { getAzureMetadata } from './getAzureMetadata';

class AzureTools {

	/**
	 * Use appropriate cluster type for the `--cluster-type` flag (`-t` short?)
	 * @param clusterProvider target cluster provider
	 */
	private determineClusterType(clusterProvider: ClusterProvider): string {
		return clusterProvider === ClusterProvider.AKS ? 'managedClusters' : 'connectedClusters';
	}

	/**
	 * Enable GitOps
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 */
	async enableGitOps(clusterNode: ClusterNode, clusterProvider: ClusterProvider) {

		const azureMetadata = await getAzureMetadata(clusterNode.name);
		if (!azureMetadata) {
			return;
		}

		await shell.execWithOutput(`az k8s-extension-private create -g ${azureMetadata.resourceGroup} -c ${azureMetadata.clusterName} -t ${this.determineClusterType(clusterProvider)} --name gitops --extension-type microsoft.flux --scope cluster --release-train stable --subscription ${azureMetadata.subscription}`);
	}

	/**
	 * Create git repository source.
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 * @param newGitRepositorySourceName kubernetes resource name
	 * @param gitUrl git repository url
	 * @param gitBranch git repository active branch
	 */
	async createGitRepository(
		clusterNode: ClusterNode,
		clusterProvider: ClusterProvider,
		newGitRepositorySourceName: string,
		gitUrl: string,
		gitBranch: string,
	) {

		const azureMetadata = await getAzureMetadata(clusterNode.name);
		if (!azureMetadata) {
			return;
		}

		return `az k8s-configuration flux create -g ${azureMetadata.resourceGroup} -c ${azureMetadata.clusterName} -t ${this.determineClusterType(clusterProvider)} --subscription ${azureMetadata.subscription} -n ${newGitRepositorySourceName} --scope cluster -u ${gitUrl} --branch ${gitBranch}`;
	}

	/**
	 * Delete source.
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 * @param sourceName target source name
	 * TODO: require namespace?
	 */
	async deleteSource(
		clusterNode: ClusterNode,
		clusterProvider: ClusterProvider,
		sourceName: string,
	) {

		const azureMetadata = await getAzureMetadata(clusterNode.name);
		if (!azureMetadata) {
			return;
		}

		await shell.execWithOutput(`az k8s-configuration flux delete -g ${azureMetadata.resourceGroup} -c ${azureMetadata.clusterName} -t ${this.determineClusterType(clusterProvider)} --subscription ${azureMetadata.subscription} -n ${sourceName} --yes`);
	}
}

/**
 * Helper methods for running `az` commands.
 */
export const azureTools = new AzureTools();
