import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { shell, ShellResult } from '../shell';
import { parseJson } from '../utils/jsonUtils';
import { ClusterNode } from '../views/nodes/clusterNode';
import { AzureMetadata, getAzureMetadata } from './getAzureMetadata';

type AzureClusterProvider = ClusterProvider.AKS | ClusterProvider.AzureARC;

class AzureTools {

	/**
	 * 1. Prompt user for: (cluster name, resource group, subscription)
	 * 2. Infer cluster type (AKS - managedClusters, Azure Arc - connectedClusters)
	 * 3. Execute the command and return ShellResult.
	 *
	 * @param command azure command to execute
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 */
	private async invokeAzCommand(
		command: string,
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
		azureMetadata?: AzureMetadata,
	): Promise<undefined | ShellResult> {
		if (!azureMetadata) {
			azureMetadata = await getAzureMetadata(clusterNode.name);
		}
		if (!azureMetadata) {
			return;
		}

		const clusterType = clusterProvider === ClusterProvider.AKS ? 'managedClusters' : 'connectedClusters';

		const metadata = `--cluster-name ${azureMetadata.clusterName} --cluster-type ${clusterType} --resource-group ${azureMetadata.resourceGroup} --subscription ${azureMetadata.subscription}`;

		return await shell.execWithOutput(`${command} ${metadata}`);
	}

	/**
	 * Enable GitOps
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 */
	async enableGitOps(
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
	) {
		await this.invokeAzCommand(
			'az k8s-extension create --name gitops --extension-type microsoft.flux --scope cluster --release-train stable',
			clusterNode,
			clusterProvider,
		);
	}

	/**
	 * Disable GitOps
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 */
	async disableGitOps(
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
	) {
		const azureMetadata = await getAzureMetadata(clusterNode.name);
		const fluxConfigurations = await this.listFluxConfigurations(clusterNode, clusterProvider, azureMetadata);
		const namesOfFluxConfigs: string[] = fluxConfigurations.map((configuration: {name: string;}) => configuration.name);

		// delete all flux configurations
		await Promise.all(namesOfFluxConfigs.map(fluxConfigName => this.invokeAzCommand(
			`az k8s-configuration flux delete -n ${fluxConfigName} --yes`,
			clusterNode,
			clusterProvider,
			azureMetadata,
		)));

		// delete flux extension
		await this.invokeAzCommand(
			'az k8s-extension delete --name gitops --yes',
			clusterNode,
			clusterProvider,
			azureMetadata,
		);
	}

	/**
	 * Disable GitOps
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 */
	private async listFluxConfigurations(
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
		azureMetadata?: AzureMetadata,
	) {
		const configurationShellResult = await this.invokeAzCommand(
			'az k8s-configuration flux list',
			clusterNode,
			clusterProvider,
			azureMetadata,
		);

		if (configurationShellResult?.code !== 0) {
			return;
		}

		return parseJson(configurationShellResult.stdout);
	}

	/**
	 * Create git repository source.
	 * @param newGitRepositorySourceName kubernetes resource name
	 * @param gitUrl git repository url
	 * @param gitBranch git repository active branch
	 * @param isSSH true when the git url protocol is SSH
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 */
	async createGitRepository(
		newGitRepositorySourceName: string,
		gitUrl: string,
		gitBranch: string,
		isSSH: boolean,
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
	): Promise<{ deployKey: string; } | undefined> {
		const gitCreateShellResult = await this.invokeAzCommand(
			`az k8s-configuration flux create -n ${newGitRepositorySourceName} --scope cluster -u ${gitUrl} --branch ${gitBranch}`,
			clusterNode,
			clusterProvider,
		);

		if (!isSSH || gitCreateShellResult?.code !== 0) {
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
	 * @param sourceName target source name
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 */
	async deleteSource(
		sourceName: string,
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
	) {
		await this.invokeAzCommand(
			`az k8s-configuration flux delete -n ${sourceName} --yes`,
			clusterNode,
			clusterProvider,
		);
	}

	/**
	 * Suspend source reconciliation.
	 * @param sourceName target source name
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 */
	async suspend(
		sourceName: string,
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
	) {
		await this.invokeAzCommand(
			`az k8s-configuration flux update -n ${sourceName} --suspend true`,
			clusterNode,
			clusterProvider,
		);
	}

	/**
	 * Resume source reconciliation.
	 * @param sourceName target source name
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 */
	async resume(
		sourceName: string,
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
	) {
		await this.invokeAzCommand(
			`az k8s-configuration flux update -n ${sourceName} --suspend false`,
			clusterNode,
			clusterProvider,
		);
	}
}

/**
 * Helper methods for running `az` commands.
 */
export const azureTools = new AzureTools();
