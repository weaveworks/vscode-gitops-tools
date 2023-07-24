import { Uri, env, window } from 'vscode';

import { fluxTools } from 'cli/flux/fluxTools';
import { ShellResult, shell, shellCodeError } from 'cli/shell/exec';
import { ClusterMetadata } from 'data/globalState';
import { globalState, telemetry } from 'extension';
import { failed } from 'types/errorable';
import { ClusterProvider } from 'types/kubernetes/clusterProvider';
import { TelemetryError } from 'types/telemetryEventNames';
import { getCurrentClusterInfo } from 'ui/treeviews/treeViews';
import { refreshAllTreeViewsCommand } from 'commands/refreshTreeViews';
import { parseJson } from 'utils/jsonUtils';
import { checkAzurePrerequisites } from './azurePrereqs';
import { getAzureMetadata } from './getAzureMetadata';
import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';

export type AzureClusterProvider = ClusterProvider.AKS | ClusterProvider.AzureARC;

/**
 * Return true when the cluster provider is either AKS or Azure Arc.
 */
export function isAzureProvider(provider: ClusterProvider): provider is AzureClusterProvider {
	return provider === ClusterProvider.AKS || provider === ClusterProvider.AzureARC;
}

export const enum AzureConstants {
	ArcNamespace = 'azure-arc',
	KubeSystemNamespace = 'kube-system',
	FluxExtensionName = 'flux',
}


export type CreateSourceGitAzureArgs = Parameters<typeof azureTools['createSourceGit']>[0];
export type CreateSourceBucketAzureArgs = Parameters<typeof azureTools['createSourceBucket']>[0];


class AzureTools {

	private async buildAzCommand(
		command: string,
		contextName: string,
		clusterProvider: AzureClusterProvider,
	): Promise<string | undefined> {

		const metadata = await getAzureMetadata(contextName, clusterProvider);

		if (!metadata) {
			return;
		}


		const clusterType = clusterProvider === ClusterProvider.AKS ? 'managedClusters' : 'connectedClusters';

		const metadataOpts = `--cluster-name ${metadata.resourceName} --cluster-type ${clusterType} --resource-group ${metadata.resourceGroup} --subscription ${metadata.subscriptionId}`;

		return `${command} ${metadataOpts}`;
	}

	/**
	 * 1. Prompt user for: (cluster name, resource group, subscription)
	 * 2. Infer cluster type (AKS - managedClusters, Azure Arc - connectedClusters)
	 * 3. Run the command and return ShellResult. Returns undefined if no metadata is selected.
	 *
	 * @param command azure command to execute
	 * @param clusterNode target cluster node
	 * @param clusterProvider target cluster provider
	 */
	public async invokeAzCommand(
		command: string,
		contextName: string,
		clusterProvider: AzureClusterProvider,
	): Promise<undefined | ShellResult> {

		const commandWithOps = await this.buildAzCommand(command, contextName, clusterProvider);

		if (!commandWithOps) {
			return;
		}

		return await shell.execWithOutput(commandWithOps);
	}



	/**
	 * Enable GitOps
	 * @see https://docs.microsoft.com/en-us/cli/azure/k8s-extension?view=azure-cli-latest#az_k8s_extension_create
	 *
	 * @param contextName target context name
	 * @param clusterProvider target cluster provider
	 */
	async enableGitOps(
		contextName: string,
		clusterProvider: AzureClusterProvider,
	) {

		const clusterPreqsReady = await checkAzurePrerequisites(clusterProvider);

		if (!clusterPreqsReady) {
			const result = await window.showWarningMessage('Required Azure extensions are not installed. Please install the prerequisites or use Flux without Azure integration ("Generic" cluster type)', {modal: true}, '"Azure GitOps Prerequisites" Docs', 'Use as "Generic" cluster');
			if(result === '"Azure GitOps Prerequisites" Docs') {
				env.openExternal(Uri.parse('https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/tutorial-use-gitops-flux2#prerequisites'));
			} else if(result === 'Use as "Generic" cluster') {
				await this.enableGitOpsGeneric(contextName);
			}
			return;
		}


		const command = await this.buildAzCommand(
			`az k8s-extension create --name ${AzureConstants.FluxExtensionName} --extension-type microsoft.flux --scope cluster`,
			contextName,
			clusterProvider,
		);

		if(!command) {
			return;
		}

		const answer = await window.showInformationMessage('Install Azure microsoft.flux extension? It will take several minutes...', {modal: true}, 'Yes', 'Use as "Generic" cluster');
		if(answer === 'Yes') {
			const result = await shell.execWithOutput(command);
			if (result?.code !== 0) {
				telemetry.sendError(TelemetryError.FAILED_TO_RUN_AZ_ENABLE_GITOPS);
			}
		} else if(answer === 'Use as "Generic" cluster') {
			await this.enableGitOpsGeneric(contextName);
		}
	}

	async enableGitOpsGeneric(contextName: string) {
		const context = kubeConfig.getContextObject(contextName);
		if (!context) {
			return;
		}

		const clusterName = context.cluster;
		const clusterMetadata: ClusterMetadata = globalState.getClusterMetadata(clusterName || contextName) || {};

		clusterMetadata.clusterProvider = ClusterProvider.Generic;
		globalState.setClusterMetadata(clusterName || contextName, clusterMetadata);
		refreshAllTreeViewsCommand();
		await fluxTools.install(contextName);
	}

	/**
	 * Disable GitOps
	 * @see https://docs.microsoft.com/en-us/cli/azure/k8s-extension?view=azure-cli-latest#az_k8s_extension_delete
	 *
	 * @param contextName target context name
	 * @param clusterProvider target cluster provider
	 */
	async disableGitOps(
		contextName: string,
		clusterProvider: AzureClusterProvider,
	) {
		const fluxConfigurations = await this.listFluxConfigurations(contextName, clusterProvider);

		if (!fluxConfigurations) {
			return;
		}

		const namesOfFluxConfigs: string[] = fluxConfigurations.map((configuration: {name: string;}) => configuration.name);

		// delete all flux configurations
		await Promise.all(namesOfFluxConfigs.map(fluxConfigName => this.invokeAzCommand(
			`az k8s-configuration flux delete -n ${fluxConfigName} --yes`,
			contextName,
			clusterProvider,
		)));

		// delete flux extension
		const disableGitOpsShellResult = await this.invokeAzCommand(
			`az k8s-extension delete --name ${AzureConstants.FluxExtensionName} --yes`,
			contextName,
			clusterProvider,
		);
		if (disableGitOpsShellResult?.code !== 0) {
			telemetry.sendError(TelemetryError.FAILED_TO_RUN_AZ_DISABLE_GITOPS);
		}
	}

	/**
	 * Return all flux resources managed by Azure.
	 * @see https://docs.microsoft.com/en-us/cli/azure/k8s-configuration/flux?view=azure-cli-latest#az_k8s_configuration_flux_list
	 *
	 * @param contextName target context name
	 * @param clusterProvider target cluster provider
	 */
	public async listFluxConfigurations(
		contextName: string,
		clusterProvider: AzureClusterProvider,
	): Promise<undefined | any[]> {
		const configurationShellResult = await this.invokeAzCommand(
			'az k8s-configuration flux list',
			contextName,
			clusterProvider,
		);

		if (configurationShellResult?.code !== 0) {
			telemetry.sendError(TelemetryError.FAILED_TO_RUN_AZ_LIST_FLUX_CONFIGURATIONS);
			return;
		}

		return parseJson(configurationShellResult.stdout);
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
		contextName: string,
		clusterProvider: AzureClusterProvider,
		kustomizationDependsOn?: string,
		kustomizationPrune?: boolean,
	) {
		const dependsOnArg = kustomizationDependsOn ? ` --depends-on "${kustomizationDependsOn}"` : '';

		const createKustomizationShellResult = await this.invokeAzCommand(
			`az k8s-configuration flux kustomization create --kustomization-name ${kustomizationName} --name ${gitRepositoryName} --path "${kustomizationPath}"${dependsOnArg} --prune ${kustomizationPrune}`,
			contextName,
			clusterProvider,
		);

		if (createKustomizationShellResult?.code !== 0) {
			telemetry.sendError(TelemetryError.FAILED_TO_RUN_AZ_CREATE_WORKLOAD);
			window.showErrorMessage(shellCodeError(createKustomizationShellResult));
			return;
		}
	}

	/**
	 * Create git repository source (optionally, with a Kustomization).
	 * @see https://docs.microsoft.com/en-us/cli/azure/k8s-configuration/flux?view=azure-cli-latest#az_k8s_configuration_flux_create
	 */
	async createSourceGit(args: {
		sourceName: string;
		azureScope?: string;
		namespace?: string;
		contextName: string;
		clusterProvider: AzureClusterProvider;
		url: string;
		branch?: string;
		tag?: string;
		semver?: string;
		commit?: string;
		interval?: string;
		timeout?: string;
		caCert?: string;
		caFile?: string;
		httpsKey?: string;
		httpsUser?: string;
		knownHosts?: string;
		knownHostsFile?: string;
		localAuthRef?: string;
		sshPrivateKey?: string;
		privateKeyFile?: string;
		kustomizationName?: string;
		kustomizationPath?: string;
		kustomizationDependsOn?: string;
		kustomizationTimeout?: string;
		kustomizationSyncInterval?: string;
		kustomizationRetryInterval?: string;
		kustomizationPrune?: boolean;
		kustomizationForce?: boolean;
	}) {
		const urlArg = ` --url "${args.url}"`;
		const scopeArg = args.azureScope ? ` --scope "${args.azureScope}"` : '';
		const namespaceArg = args.namespace ? ` --namespace "${args.namespace}"` : '';
		const branchArg = args.branch ? ` --branch "${args.branch}"` : '';
		const tagArg = args.tag ? ` --tag "${args.tag}"` : '';
		const semverArg = args.semver ? ` --semver "${args.semver}"` : '';
		const commitArg = args.commit ? ` --commit "${args.commit}"` : '';
		const intervalArg = args.interval ? ` --interval "${args.interval}"` : '';
		const timeoutArg = args.timeout ? ` --timeout "${args.timeout}"` : '';
		const caCertArg = args.caCert ? ` --https-ca-cert "${args.caCert}"` : '';
		const caCertFileArg = args.caFile ? ` --https-ca-cert-file "${args.caFile}"` : '';
		const httpsKeyArg = args.httpsKey ? ` --https-key "${args.httpsKey}"` : '';
		const httpsUserArg = args.httpsUser ? ` --https-user "${args.httpsUser}"` : '';
		const knownHostsArg = args.knownHosts ? ` --known-hosts "${args.knownHosts}"` : '';
		const knownHostsFileArg = args.knownHostsFile ? ` --known-hosts-file "${args.knownHostsFile}"` : '';
		const localAuthRefArg = args.localAuthRef ? ` --local-auth-ref "${args.localAuthRef}"` : '';
		const sshPrivateKeyArg = args.sshPrivateKey ? ` --ssh-private-key "${args.sshPrivateKey}"` : '';
		const sshPrivateKeyFileArg = args.privateKeyFile ? ` --ssh-private-key-file "${args.privateKeyFile}"` : '';

		const createSourceShellResult = await this.invokeAzCommand(
			`az k8s-configuration flux create --name ${args.sourceName}${urlArg}${scopeArg}${namespaceArg}${branchArg}${tagArg}${semverArg}${commitArg}${intervalArg}${timeoutArg}${caCertArg}${caCertFileArg}${httpsKeyArg}${httpsUserArg}${knownHostsArg}${knownHostsFileArg}${localAuthRefArg}${sshPrivateKeyArg}${sshPrivateKeyFileArg}${this.makeKustomizationQueryPiece(args)}`,
			args.contextName,
			args.clusterProvider,
		);

		if (createSourceShellResult?.code !== 0) {
			telemetry.sendError(TelemetryError.FAILED_TO_RUN_AZ_CREATE_SOURCE);
			return;
		}

		const createSourceOutput = parseJson(createSourceShellResult.stdout);
		if (!createSourceOutput) {
			return;
		}

		const deployKey: string | undefined = createSourceOutput.repositoryPublicKey;

		return deployKey;
	}

	/**
	 * Create bucket
	 */
	async createSourceBucket(args: {
		url: string;
		configurationName: string;
		bucketName: string;
		contextName: string;
		clusterProvider: AzureClusterProvider;
		sourceScope?: string;
		sourceNamespace?: string;
		accessKey: string;
		secretKey: string;
		insecure: boolean;
		secretRef: string;
		kustomizationName?: string;
		kustomizationPath?: string;
		kustomizationDependsOn?: string;
		kustomizationTimeout?: string;
		kustomizationSyncInterval?: string;
		kustomizationRetryInterval?: string;
		kustomizationPrune?: boolean;
		kustomizationForce?: boolean;
	}) {
		const bucketNameArg = ` --bucket-name "${args.bucketName}"`;
		const urlArg = ` --url "${args.url}"`;
		const scopeArg = args.sourceScope ? ` --scope "${args.sourceScope}"` : '';
		const namespaceArg = args.sourceNamespace ? ` --namespace "${args.sourceNamespace}"` : '';
		const accessKeyArg = args.accessKey ? ` --bucket-access-key "${args.accessKey}"` : '';
		const secretKeyArg = args.secretKey ? ` --bucket-secret-key "${args.secretKey}"` : '';
		const secretRefArg = args.secretRef ? ` --local-auth-ref "${args.secretRef}"` : '';
		const insecureArg = args.insecure ? ' --bucket-insecure' : '';

		const createBucketShellResult = await this.invokeAzCommand(
			`az k8s-configuration flux create --kind bucket --name ${args.configurationName}${scopeArg}${namespaceArg}${bucketNameArg}${urlArg}${accessKeyArg}${secretKeyArg}${secretRefArg}${insecureArg}${this.makeKustomizationQueryPiece(args)}`,
			args.contextName,
			args.clusterProvider,
		);
	}

	/**
	 * Compose Kustomization part of the query when creating a source.
	 */
	private makeKustomizationQueryPiece(args: {
		kustomizationName?: string;
		kustomizationPath?: string;
		kustomizationDependsOn?: string;
		kustomizationTimeout?: string;
		kustomizationSyncInterval?: string;
		kustomizationRetryInterval?: string;
		kustomizationPrune?: boolean;
		kustomizationForce?: boolean;
	}): string {
		let kustomizationPart = '';
		const kustomizationName = args.kustomizationName ? ` name="${args.kustomizationName}"` : '';
		const kustomizationPath = args.kustomizationPath ? ` path="${args.kustomizationPath}"` : '';
		const kustomizationDependsOn = args.kustomizationDependsOn ? ` depends_on="${args.kustomizationDependsOn}"` : '';
		const kustomizationTimeout = args.kustomizationTimeout ? ` timeout="${args.kustomizationTimeout}"` : '';
		const kustomizationSyncInterval = args.kustomizationSyncInterval ? ` sync_interval="${args.kustomizationSyncInterval}"` : '';
		const kustomizationRetryInterval = args.kustomizationRetryInterval ? ` retry_interval="${args.kustomizationRetryInterval}"` : '';
		const kustomizationPrune = args.kustomizationPrune ? ' prune=true' : '';
		const kustomizationForce = args.kustomizationForce ? ' force=true' : '';

		if (kustomizationName || kustomizationPath || kustomizationDependsOn || kustomizationTimeout || kustomizationSyncInterval || kustomizationRetryInterval || kustomizationPrune || kustomizationForce) {
			kustomizationPart = ` --kustomization${kustomizationName}${kustomizationPath}${kustomizationDependsOn}${kustomizationTimeout}${kustomizationSyncInterval}${kustomizationRetryInterval}${kustomizationPrune}${kustomizationForce}`;
		}

		return kustomizationPart;
	}

	/**
	 * Delete source.
	 * @see https://docs.microsoft.com/en-us/cli/azure/k8s-configuration/flux?view=azure-cli-latest#az_k8s_configuration_flux_delete
	 *
	 * @param sourceName target source name
	 * @param contextName target context name
	 * @param clusterProvider target cluster provider
	 */
	async deleteSource(
		sourceName: string,
		contextName: string,
		clusterProvider: AzureClusterProvider,
	) {
		const deleteSourceShellResult = await this.invokeAzCommand(
			`az k8s-configuration flux delete -n ${sourceName} --yes`,
			contextName,
			clusterProvider,
		);
		if (deleteSourceShellResult?.code !== 0) {
			telemetry.sendError(TelemetryError.FAILED_TO_RUN_AZ_DELETE_SOURCE);
		}
	}


	async deleteKustomization(
		configName: string,
		kustomizationName: string,
		contextName: string,
		clusterProvider: AzureClusterProvider,
	) {
		const deleteSourceShellResult = await this.invokeAzCommand(
			`az k8s-configuration flux kustomization delete -n ${configName} -k ${kustomizationName} --yes`,
			contextName,
			clusterProvider,
		);
		if (deleteSourceShellResult?.code !== 0) {
			telemetry.sendError(TelemetryError.FAILED_TO_RUN_AZ_DELETE_WORKLOAD);
		}
	}

	/**
	 * Suspend source reconciliation.
	 * @see https://docs.microsoft.com/en-us/cli/azure/k8s-configuration/flux?view=azure-cli-latest#az_k8s_configuration_flux_update
	 *
	 * @param sourceName target source name
	 * @param contextName target context name
	 * @param clusterProvider target cluster provider
	 */
	async suspend(
		sourceName: string,
		contextName: string,
		clusterProvider: AzureClusterProvider,
	) {
		const suspendShellResult = await this.invokeAzCommand(
			`az k8s-configuration flux update -n ${sourceName} --suspend true`,
			contextName,
			clusterProvider,
		);
		if (suspendShellResult?.code !== 0) {
			telemetry.sendError(TelemetryError.FAILED_TO_RUN_AZ_SUSPEND_SOURCE);
		}
	}

	/**
	 * Resume source reconciliation.
	 * @see https://docs.microsoft.com/en-us/cli/azure/k8s-configuration/flux?view=azure-cli-latest#az_k8s_configuration_flux_update
	 *
	 * @param sourceName target source name
	 * @param contextName target context name
	 * @param clusterProvider target cluster provider
	 */
	async resume(
		sourceName: string,
		contextName: string,
		clusterProvider: AzureClusterProvider,
	) {
		const resumeShellResult = await this.invokeAzCommand(
			`az k8s-configuration flux update -n ${sourceName} --suspend false`,
			contextName,
			clusterProvider,
		);
		if (resumeShellResult?.code !== 0) {
			telemetry.sendError(TelemetryError.FAILED_TO_RUN_AZ_RESUME_SOURCE);
		}
	}


	getAzName(fluxConfigName: string, resourceName: string) {
		return resourceName.replace(RegExp(`^${fluxConfigName}-`), '');
	}


}

/**
 * Helper methods for running `az` commands.
 */
export const azureTools = new AzureTools();
