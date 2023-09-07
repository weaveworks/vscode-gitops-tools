import { AzureClusterProvider, azureTools, CreateSourceGitAzureArgs } from 'cli/azure/azureTools';
import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { showDeployKeyNotificationIfNeeded } from 'commands/createSource';
import { telemetry } from 'extension';
import { ClusterInfo } from 'types/kubernetes/clusterProvider';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { TelemetryEvent } from 'types/telemetryEventNames';
import { reloadSourcesTreeView, reloadWorkloadsTreeView } from 'ui/treeviews/treeViews';
import { splitNamespacedFluxObject } from 'utils/namespacedFluxObject';
import { ParamsDictionary } from 'utils/typeUtils';

export async function createConfigurationAzure(data: ParamsDictionary) {
	const clusterInfo = data.clusterInfo as ClusterInfo;
	const contextName = kubeConfig.getCurrentContext();
	const source = data.source;
	const kustomization = data.kustomization;

	if(source) {
		if(source.kind === 'GitRepository') {
			createGitSourceAzure(source, kustomization, clusterInfo);
		} else if(source.kind === 'Bucket') {
			createBucketSourceAzure(source, kustomization, clusterInfo);
		}

	} else if(kustomization) {
		const gitRepositoryName = splitNamespacedFluxObject(kustomization.source).name;
		azureTools.createKustomization(kustomization.name, gitRepositoryName, kustomization.path,
			contextName, clusterInfo.clusterProvider as AzureClusterProvider, kustomization.dependsOn, kustomization.prune);
	}
}

async function createGitSourceAzure(source: ParamsDictionary, kustomization: ParamsDictionary, clusterInfo: ClusterInfo) {
	const args = {
		contextName: kubeConfig.getCurrentContext(),
		sourceName: source.name,
		url: source.url,
		...source,
		...clusterInfo,
		kustomizationName: kustomization?.name,
		kustomizationPath: kustomization?.path,
		kustomizationDependsOn: kustomization?.dependsOn,
		kustomizationPrune: kustomization?.prune,
	} as CreateSourceGitAzureArgs;


	telemetry.send(TelemetryEvent.CreateSource, {
		kind: Kind.GitRepository,
	});

	const deployKey = await azureTools.createSourceGit(args);

	setTimeout(() => {
		// Wait a bit for the repository to have a failed state in case of SSH url
		reloadSourcesTreeView();
		reloadWorkloadsTreeView();
	}, 1000);

	showDeployKeyNotificationIfNeeded(args.url, deployKey);
}


async function createBucketSourceAzure(source: ParamsDictionary, kustomization: ParamsDictionary, clusterInfo: ClusterInfo) {
	telemetry.send(TelemetryEvent.CreateSource, {
		kind: Kind.Bucket,
	});

	const args: any = {
		contextName: kubeConfig.getCurrentContext(),
		sourceName: source.name,
		url: source.endpoint,
		configurationName: source.name,
		bucketName: source.bucketName,
		sourceScope: source.azureScope,
		sourceNamespace: source.namespace,
		...source,
		...clusterInfo,
		kustomizationName: kustomization?.name,
		kustomizationPath: kustomization?.name,
		kustomizationDependsOn: kustomization?.name,
		kustomizationPrune: kustomization?.prune,
	} as CreateSourceGitAzureArgs;

	await azureTools.createSourceBucket(args);

	setTimeout(() => {
		reloadSourcesTreeView();
		reloadWorkloadsTreeView();
	}, 1000);
}



