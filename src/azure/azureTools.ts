import { window, env, Uri } from 'vscode';
import { globalState, telemetry } from '../extension';
import { ClusterMetadata } from '../globalState';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { ClusterProvider, ConfigMap, knownClusterProviders } from '../kubernetes/kubernetesTypes';
import { shell, shellCodeError, ShellResult } from '../shell';
import { TelemetryErrorEventNames } from '../telemetry';
import { parseJson } from '../utils/jsonUtils';
import { getCurrentClusterInfo, refreshAllTreeViews } from '../views/treeViews';
import { failed } from '../errorable';
import { fluxTools } from '../flux/fluxTools';
import { getAzureMetadata } from './getAzureMetadata';

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

		const clusterPreqsReady = await this.checkPrerequisites(clusterProvider);

		if (!clusterPreqsReady) {
			const result = await window.showWarningMessage('Required Azure extensions are not installed. Please install the prerequisites or use Flux without Azure integration ("Generic" cluster type)', '"Azure GitOps Prerequisites" Docs', 'Enable as "Generic" cluster');
			if(result === '"Azure GitOps Prerequisites" Docs') {
				env.openExternal(Uri.parse('https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/tutorial-use-gitops-flux2#prerequisites'));
			} else if(result === 'Enable as "Generic" cluster') {
				const currentClusterInfo = await getCurrentClusterInfo();
				if (failed(currentClusterInfo)) {
					return;
				}

				const clusterName = currentClusterInfo.result.clusterName;
				const clusterMetadata: ClusterMetadata = globalState.getClusterMetadata(clusterName) || {};

				clusterMetadata.clusterProvider = ClusterProvider.Generic;
				globalState.setClusterMetadata(clusterName, clusterMetadata);
				refreshAllTreeViews();
				await fluxTools.install(contextName);
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

		window.showInformationMessage('Installing AKS microsoft.flux extension. It will take several minutes...', 'OK');
		const result = await shell.execWithOutput(command);
		if (result?.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_AZ_ENABLE_GITOPS);
		}
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
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_AZ_DISABLE_GITOPS);
		}
	}

	/**
	 * Return all flux resources managed by Azure.
	 * @see https://docs.microsoft.com/en-us/cli/azure/k8s-configuration/flux?view=azure-cli-latest#az_k8s_configuration_flux_list
	 *
	 * @param contextName target context name
	 * @param clusterProvider target cluster provider
	 */
	private async listFluxConfigurations(
		contextName: string,
		clusterProvider: AzureClusterProvider,
	): Promise<undefined | any[]> {
		const configurationShellResult = await this.invokeAzCommand(
			'az k8s-configuration flux list',
			contextName,
			clusterProvider,
		);

		if (configurationShellResult?.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_AZ_LIST_FLUX_CONFIGURATIONS);
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
	) {
		const createKustomizationShellResult = await this.invokeAzCommand(
			`az k8s-configuration flux kustomization create --kustomization-name ${kustomizationName} --name ${gitRepositoryName} --path "${kustomizationPath}" --prune true`,
			contextName,
			clusterProvider,
		);

		if (createKustomizationShellResult?.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_AZ_CREATE_WORKLOAD);
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
		sourceScope?: string;
		sourceNamespace?: string;
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
		caCertFile?: string;
		httpsKey?: string;
		httpsUser?: string;
		knownHosts?: string;
		knownHostsFile?: string;
		localAuthRef?: string;
		sshPrivateKey?: string;
		sshPrivateKeyFile?: string;
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
		const scopeArg = args.sourceScope ? ` --scope "${args.sourceScope}"` : '';
		const namespaceArg = args.sourceNamespace ? ` --namespace "${args.sourceNamespace}"` : '';
		const branchArg = args.branch ? ` --branch "${args.branch}"` : '';
		const tagArg = args.tag ? ` --tag "${args.tag}"` : '';
		const semverArg = args.semver ? ` --semver "${args.semver}"` : '';
		const commitArg = args.commit ? ` --commit "${args.commit}"` : '';
		const intervalArg = args.interval ? ` --interval "${args.interval}"` : '';
		const timeoutArg = args.timeout ? ` --timeout "${args.timeout}"` : '';
		const caCertArg = args.caCert ? ` --https-ca-cert "${args.caCert}"` : '';
		const caCertFileArg = args.caCertFile ? ` --https-ca-cert-file "${args.caCertFile}"` : '';
		const httpsKeyArg = args.httpsKey ? ` --https-key "${args.httpsKey}"` : '';
		const httpsUserArg = args.httpsUser ? ` --https-user "${args.httpsUser}"` : '';
		const knownHostsArg = args.knownHosts ? ` --known-hosts "${args.knownHosts}"` : '';
		const knownHostsFileArg = args.knownHostsFile ? ` --known-hosts-file "${args.knownHostsFile}"` : '';
		const localAuthRefArg = args.localAuthRef ? ` --local-auth-ref "${args.localAuthRef}"` : '';
		const sshPrivateKeyArg = args.sshPrivateKey ? ` --ssh-private-key "${args.sshPrivateKey}"` : '';
		const sshPrivateKeyFileArg = args.sshPrivateKeyFile ? ` --ssh-private-key-file "${args.sshPrivateKeyFile}"` : '';

		const createSourceShellResult = await this.invokeAzCommand(
			`az k8s-configuration flux create --name ${args.sourceName}${urlArg}${scopeArg}${namespaceArg}${branchArg}${tagArg}${semverArg}${commitArg}${intervalArg}${timeoutArg}${caCertArg}${caCertFileArg}${httpsKeyArg}${httpsUserArg}${knownHostsArg}${knownHostsFileArg}${localAuthRefArg}${sshPrivateKeyArg}${sshPrivateKeyFileArg}${this.makeKustomizationQueryPiece(args)}`,
			args.contextName,
			args.clusterProvider,
		);

		if (createSourceShellResult?.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_AZ_CREATE_SOURCE);
			return;
		}

		const createSourceOutput = parseJson(createSourceShellResult.stdout);
		if (!createSourceOutput) {
			return;
		}

		const deployKey: string | undefined = createSourceOutput.repositoryPublicKey;
		if (!deployKey) {
			return;
		}

		return {
			deployKey,
		};
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
		const insecureArg = args.insecure ? ' --bucket-insecure' : '';

		const createBucketShellResult = await this.invokeAzCommand(
			`az k8s-configuration flux create --kind bucket --name ${args.configurationName}${scopeArg}${namespaceArg}${bucketNameArg}${urlArg}${accessKeyArg}${secretKeyArg}${insecureArg}${this.makeKustomizationQueryPiece(args)}`,
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
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_AZ_DELETE_SOURCE);
		}
	}


	async deleteKustomization(
		kustomizationName: string,
		contextName: string,
		clusterProvider: AzureClusterProvider,
	) {
		const deleteSourceShellResult = await this.invokeAzCommand(
			`az k8s-configuration flux kustomization delete -n ${kustomizationName} --yes`,
			contextName,
			clusterProvider,
		);
		if (deleteSourceShellResult?.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_AZ_DELETE_WORKLOAD);
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
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_AZ_SUSPEND_SOURCE);
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
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_AZ_RESUME_SOURCE);
		}
	}

	/**
	 * Return true if all prerequisites for installing Azure cluster extension 'microsoft.flux' are ready
	 */
	async checkPrerequisites(clusterProvider: AzureClusterProvider): Promise<boolean> {
		const results = await Promise.all([
			this.checkPrerequistesProviders(),
			this.checkPrerequistesCliExtensions(),
			this.checkPrerequistesFeatures(),
		]);

		if(clusterProvider === ClusterProvider.AKS) {
			return (results[0] && results[1] && results[2]);
		} else {
			return (results[0] && results[1]);
		}
	}

	async checkPrerequistesFeatures(): Promise<boolean> {
		const result = await shell.execWithOutput('az feature show --namespace Microsoft.ContainerService -n AKS-ExtensionManager');
		return result.stdout.includes('"state": "Registered"');
	}

	async checkPrerequistesProviders(): Promise<boolean> {
		const result = await shell.execWithOutput('az provider list -o table');
		const lines = result.stdout.replace(/\r\n/g,'\n').split('\n');

		let registeredCompontents = 0;
		for(let line of lines) {
			if(/^Microsoft.Kubernetes\b.*\bRegistered\b/.test(line)) {
				registeredCompontents++;
			}
			if(/^Microsoft.KubernetesConfiguration\b.*\bRegistered\b/.test(line)) {
				registeredCompontents++;
			}
			if(/^Microsoft.ContainerService\b.*\bRegistered\b/.test(line)) {
				registeredCompontents++;
			}
		}

		return registeredCompontents === 3;
	}

	async checkPrerequistesCliExtensions(): Promise<boolean> {
		const result = await shell.execWithOutput('az extension list -o table');

		return result.stdout.includes('k8s-configuration') && result.stdout.includes('k8s-extension');
	}
}

/**
 * Helper methods for running `az` commands.
 */
export const azureTools = new AzureTools();
