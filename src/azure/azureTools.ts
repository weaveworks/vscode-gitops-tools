import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { shell } from '../shell';
import { parseJson } from '../utils/jsonUtils';
import { ClusterNode } from '../views/nodes/clusterNode';
import { getAzureMetadata } from './getAzureMetadata';

type AzureClusterProvider = ClusterProvider.AKS | ClusterProvider.AzureARC;

class AzureTools {

	/**
	 * Use appropriate cluster type for the `--cluster-type` flag (`-t` short?)
	 * @param clusterProvider target cluster provider
	 */
	private determineClusterType(clusterProvider: AzureClusterProvider): string {
		return clusterProvider === ClusterProvider.AKS ? 'managedClusters' : 'connectedClusters';
	}

	/**
	 * Enable GitOps
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 */
	async enableGitOps(clusterNode: ClusterNode, clusterProvider: AzureClusterProvider) {

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
	 * @param isSSH true when the git url protocol is SSH
	 */
	async createGitRepository(
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
		newGitRepositorySourceName: string,
		gitUrl: string,
		gitBranch: string,
		isSSH: boolean,
	): Promise<{ deployKey: string; } | undefined> {

		const azureMetadata = await getAzureMetadata(clusterNode.name);
		if (!azureMetadata) {
			return;
		}

		const gitCreateShellResult = await shell.execWithOutput(`az k8s-configuration flux create -g ${azureMetadata.resourceGroup} -c ${azureMetadata.clusterName} -t ${this.determineClusterType(clusterProvider)} --subscription ${azureMetadata.subscription} -n ${newGitRepositorySourceName} --scope cluster -u ${gitUrl} --branch ${gitBranch}`);

		if (!isSSH || gitCreateShellResult.code !== 0) {
			return;
		}

		const output = parseJson(gitCreateShellResult.stdout);
		if (!output) {
			return;
		}

		return {
			deployKey: output.repositoryPublicKey,
		};
	}

	/**
	 * Delete source.
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 * @param sourceName target source name
	 */
	async deleteSource(
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
		sourceName: string,
	) {

		const azureMetadata = await getAzureMetadata(clusterNode.name);
		if (!azureMetadata) {
			return;
		}

		await shell.execWithOutput(`az k8s-configuration flux delete -g ${azureMetadata.resourceGroup} -c ${azureMetadata.clusterName} -t ${this.determineClusterType(clusterProvider)} --subscription ${azureMetadata.subscription} -n ${sourceName} --yes`);
	}

	/**
	 * Suspend source reconciliation.
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 * @param sourceName target source name
	 */
	async suspend(
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
		sourceName: string,
	) {
		await this.resumeSuspend(clusterNode, clusterProvider, sourceName, true);
	}

	/**
	 * Resume source reconciliation.
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 * @param sourceName target source name
	 */
	async resume(
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
		sourceName: string,
	) {
		await this.resumeSuspend(clusterNode, clusterProvider, sourceName, false);
	}

	/**
	 * Resume/suspend source reconciliation.
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 * @param sourceName target source name
	 */
	private async resumeSuspend(
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
		sourceName: string,
		suspend: boolean,
	) {

		const azureMetadata = await getAzureMetadata(clusterNode.name);
		if (!azureMetadata) {
			return;
		}

		await shell.execWithOutput(`az k8s-configuration flux update -g ${azureMetadata.resourceGroup} -c ${azureMetadata.clusterName} -t ${this.determineClusterType(clusterProvider)} --subscription ${azureMetadata.subscription} -n ${sourceName} --suspend ${suspend}`);
	}
}

/**
 * Helper methods for running `az` commands.
 */
export const azureTools = new AzureTools();
