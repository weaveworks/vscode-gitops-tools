import { AzureClusterProvider, azureTools, CreateSourceBucketAzureArgs, CreateSourceGitAzureArgs } from '../../../azure/azureTools';
import { showDeployKeyNotificationIfNeeded } from '../../../commands/createSource';
import { telemetry } from '../../../extension';
import { ClusterInfo, KubernetesObjectKinds } from '../../../kubernetes/types/kubernetesTypes';
import { TelemetryEventNames } from '../../../telemetry';
import { ParamsDictionary } from '../../../utils/typeUtils';
import { refreshSourcesTreeView, refreshWorkloadsTreeView } from '../../../views/treeViews';

export async function createConfigurationAzure(data: ParamsDictionary) {
	const clusterInfo = data.clusterInfo as ClusterInfo;
	const source = data.source;
	const kustomization = data.kustomization;

	if(source) {
		if(source.kind === 'GitRepository') {
			createGitSourceAzure(source, kustomization, clusterInfo);
		} else if(source.kind === 'Bucket') {
			createBucketSourceAzure(source, kustomization, clusterInfo);
		}

	} else if(kustomization) {
		azureTools.createKustomization(kustomization.name, kustomization.source, kustomization.path,
			clusterInfo.contextName, clusterInfo.clusterProvider as AzureClusterProvider, kustomization.dependsOn, kustomization.prune);
	}
}

async function createGitSourceAzure(source: ParamsDictionary, kustomization: ParamsDictionary, clusterInfo: ClusterInfo) {
	const args = {
		sourceName: source.name,
		url: source.url,
		...source,
		...clusterInfo,
		kustomizationName: kustomization?.name,
		kustomizationPath: kustomization?.path,
		kustomizationDependsOn: kustomization?.dependsOn,
		kustomizationPrune: kustomization?.prune,
	} as CreateSourceGitAzureArgs;


	telemetry.send(TelemetryEventNames.CreateSource, {
		kind: KubernetesObjectKinds.GitRepository,
	});

	const deployKey = await azureTools.createSourceGit(args);

	setTimeout(() => {
		// Wait a bit for the repository to have a failed state in case of SSH url
		refreshSourcesTreeView();
		refreshWorkloadsTreeView();
	}, 1000);

	showDeployKeyNotificationIfNeeded(args.url, deployKey);
}


async function createBucketSourceAzure(source: ParamsDictionary, kustomization: ParamsDictionary, clusterInfo: ClusterInfo) {
	telemetry.send(TelemetryEventNames.CreateSource, {
		kind: KubernetesObjectKinds.Bucket,
	});

	const args: any = {
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
		refreshSourcesTreeView();
		refreshWorkloadsTreeView();
	}, 1000);
}



