import { window } from 'vscode';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { ClusterProvider, ConfigMap } from '../kubernetes/kubernetesTypes';
import { shell, ShellResult } from '../shell';
import { parseJson } from '../utils/jsonUtils';
import { ClusterNode } from '../views/nodes/clusterNode';
import { askUserForAzureMetadata } from './getAzureMetadata';

type AzureClusterProvider = ClusterProvider.AKS | ClusterProvider.AzureARC;

/**
 * Return true when the cluster provider is either AKS or Azure Arc.
 */
export function isAzureProvider(provider: ClusterProvider): provider is AzureClusterProvider {
	return provider === ClusterProvider.AKS || provider === ClusterProvider.AzureARC;
}


export const enum AzureConstants {
	ArcNamespace = 'azure-arc',
	KubeSystemNamespace = 'kube-system',
}

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
	): Promise<undefined | ShellResult> {

		let azureMetadata = await this.getAzureMetadata(clusterNode, clusterProvider);
		if (!azureMetadata) {
			window.showWarningMessage('Failed to get Azure resource name, resource group, subscription ID.');
			azureMetadata = await askUserForAzureMetadata(clusterNode.name);
		}

		if (!azureMetadata) {
			return;
		}

		const clusterType = clusterProvider === ClusterProvider.AKS ? 'managedClusters' : 'connectedClusters';

		const metadata = `--cluster-name ${azureMetadata.resourceName} --cluster-type ${clusterType} --resource-group ${azureMetadata.resourceGroup} --subscription ${azureMetadata.subscriptionId}`;

		return await shell.execWithOutput(`${command} ${metadata}`);
	}

	/**
	 * Get azure data from the configmaps.
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 */
	async getAzureMetadata(
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
	) {

		let configMapShellResult: ShellResult | undefined;
		if (clusterProvider === ClusterProvider.AKS) {
			configMapShellResult = await kubernetesTools.invokeKubectlCommand(`get configmaps extension-manager-config -n ${AzureConstants.KubeSystemNamespace} --context=${clusterNode.name} --ignore-not-found -o json`);
		} else {
			configMapShellResult = await kubernetesTools.invokeKubectlCommand(`get configmaps azure-clusterconfig -n ${AzureConstants.ArcNamespace} --context=${clusterNode.name} --ignore-not-found -o json`);
		}

		if (configMapShellResult?.code !== 0) {
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

	/**
	 * Enable GitOps
	 * @see https://docs.microsoft.com/en-us/cli/azure/k8s-extension?view=azure-cli-latest#az_k8s_extension_create
	 *
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
	 * @see https://docs.microsoft.com/en-us/cli/azure/k8s-extension?view=azure-cli-latest#az_k8s_extension_delete
	 *
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 */
	async disableGitOps(
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
	) {
		const fluxConfigurations = await this.listFluxConfigurations(clusterNode, clusterProvider);

		if (!fluxConfigurations) {
			return;
		}

		const namesOfFluxConfigs: string[] = fluxConfigurations.map((configuration: {name: string;}) => configuration.name);

		// delete all flux configurations
		await Promise.all(namesOfFluxConfigs.map(fluxConfigName => this.invokeAzCommand(
			`az k8s-configuration flux delete -n ${fluxConfigName} --yes`,
			clusterNode,
			clusterProvider,
		)));

		// delete flux extension
		await this.invokeAzCommand(
			'az k8s-extension delete --name gitops --yes',
			clusterNode,
			clusterProvider,
		);
	}

	/**
	 * Return all flux resources managed by Azure.
	 * @see https://docs.microsoft.com/en-us/cli/azure/k8s-configuration/flux?view=azure-cli-latest#az_k8s_configuration_flux_list
	 *
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 */
	private async listFluxConfigurations(
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
	): Promise<undefined | any[]> {
		const configurationShellResult = await this.invokeAzCommand(
			'az k8s-configuration flux list',
			clusterNode,
			clusterProvider,
		);

		if (configurationShellResult?.code !== 0) {
			return;
		}

		return parseJson(configurationShellResult.stdout);
	}

	/**
	 * Create git repository source.
	 * @see https://docs.microsoft.com/en-us/cli/azure/k8s-configuration/flux?view=azure-cli-latest#az_k8s_configuration_flux_create
	 *
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
	 * Create Kustomization.
	 * @see https://docs.microsoft.com/en-us/cli/azure/k8s-configuration/flux/kustomization?view=azure-cli-latest#az_k8s_configuration_flux_kustomization_create
	 *
	 * @param kustomizationName name of the new kustomization
	 * @param gitRepositoryName git source name of the new kustomization
	 * @param kustomizationPath kustomization spec path property value
	 */
	async createKustomization(
		kustomizationName: string,
		gitRepositoryName: string,
		kustomizationPath: string,
		clusterNode: ClusterNode,
		clusterProvider: AzureClusterProvider,
	) {
		const createKustomizationShellResult = await this.invokeAzCommand(
			`az k8s-configuration flux kustomization create --kustomization-name ${kustomizationName} --name ${gitRepositoryName} --path "${kustomizationPath}" --prune true`,
			clusterNode,
			clusterProvider,
		);

		if (createKustomizationShellResult?.code !== 0) {
			window.showErrorMessage(createKustomizationShellResult?.stderr || '');
			return;
		}
	}

	/**
	 * Delete source.
	 * @see https://docs.microsoft.com/en-us/cli/azure/k8s-configuration/flux?view=azure-cli-latest#az_k8s_configuration_flux_delete
	 *
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
	 * @see https://docs.microsoft.com/en-us/cli/azure/k8s-configuration/flux?view=azure-cli-latest#az_k8s_configuration_flux_update
	 *
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
	 * @see https://docs.microsoft.com/en-us/cli/azure/k8s-configuration/flux?view=azure-cli-latest#az_k8s_configuration_flux_update
	 *
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
