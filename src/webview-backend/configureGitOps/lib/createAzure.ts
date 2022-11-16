import { AzureClusterProvider, azureTools, CreateSourceGitAzureArgs } from '../../../azure/azureTools';
import { ClusterInfo } from '../../../kubernetes/types/kubernetesTypes';
import { ParamsDictionary } from '../../../utils/typeUtils';

export async function createConfigurationAzure(data: ParamsDictionary) {
	const clusterInfo = data.clusterInfo as ClusterInfo;
	const source = data.source;
	const kustomization = data.kustomization;

	if(source) {
		const args: CreateSourceGitAzureArgs = {
			sourceName: source.name,
			...source,
			...clusterInfo,
			kustomizationName: kustomization?.name,
			kustomizationPath: kustomization?.path,
			kustomizationDependsOn: kustomization?.dependsOn,
			kustomizationPrune: kustomization?.prune,
		};
		await azureTools.createSourceGit(args);
	} else if(kustomization) {
		azureTools.createKustomization(kustomization.name, data.selectedSource, kustomization.path,
			clusterInfo.contextName, clusterInfo.clusterProvider as AzureClusterProvider, kustomization.dependsOn, kustomization.prune);
	}
}


