import { window, workspace } from 'vscode';
import { AzureClusterProvider, azureTools, CreateSourceGitAzureArgs } from '../azure/azureTools';
import { failed } from '../errorable';
import { telemetry } from '../extension';
import { getExtensionContext } from '../extensionContext';
import { getOpenedFolderGitInfo, GitInfo } from '../git/getOpenedFolderGitInfo';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { createOrShowConfigureGitOpsPanel } from './ConfigureGitOpsPanel';
import { TelemetryEventNames } from '../telemetry';
import { ClusterInfo, getCurrentClusterInfo, refreshAllTreeViews } from '../views/treeViews';
import { createGitRepositoryGenericCluster } from '../commands/createSource';
import { ParamsDictionary } from '../utils/typeUtils';
import { CreateSourceGitGenericArgs, fluxTools } from '../flux/fluxTools';
import { removeEmptyStrings } from '../utils/objectUtils';

/**
 * Open the webview editor with a form to enter all the flags
 * needed to create a source (and possibly Kustomization
 * if the current cluster is Azure)
 */
export async function openConfigureGitOpsPanel(selectSource: boolean, selectedSource?: string) {
	telemetry.send(TelemetryEventNames.CreateSourceOpenWebview);

	const clusterInfo = await getCurrentClusterInfo();
	if (failed(clusterInfo)) {
		return;
	}
	if (clusterInfo.result.clusterProvider === ClusterProvider.Unknown) {
		window.showErrorMessage('Cluster provider is not detected yet.');
		return;
	}
	if (clusterInfo.result.clusterProvider === ClusterProvider.DetectionFailed) {
		window.showErrorMessage('Cluster provider detection failed.');
		return;
	}

	let gitInfo: GitInfo | undefined;
	if (workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
		// use the first open folder
		gitInfo = await getOpenedFolderGitInfo(workspace.workspaceFolders[0].uri);
	}

	const [nsResults, grResults] = await Promise.all([kubernetesTools.getNamespaces(), kubernetesTools.getGitRepositories()]);
	const namespaces = nsResults?.items.map(i => i.metadata.name) as string[];
	const sources = grResults?.items.map(i => i.metadata.name) as string[];

	const webviewParams = {
		clusterInfo: clusterInfo.result,
		gitInfo,
		namespaces: namespaces,
		sources: sources,
		selectSourceTab: selectSource,
		selectedSource: selectedSource || '',
	};

	createOrShowConfigureGitOpsPanel(getExtensionContext().extensionUri, webviewParams);
}

export async function submitConfigureGitOps(data: any) {
	data = removeEmptyStrings(data);

	const clusterInfo = data.clusterInfo as ClusterInfo;

	if(data.source) {
		data.source.branch = data.source.refType === 'branch' ? data.source.ref : undefined;
		data.source.tag = data.source.refType === 'tag' ? data.source.ref : undefined;
		data.source.semver = data.source.refType === 'semver' ? data.source.ref : undefined;

	}

	if(clusterInfo.isAzure && (data.source?.createFluxConfig || data.selectedSource)) {
		configureAzure(data, clusterInfo);
	} else {
		await configureGeneric(data);
	}
}




async function configureGeneric(data: ParamsDictionary) {
	const source = data.source;
	if(source) {
		const args: CreateSourceGitGenericArgs = {
			sourceName: source.name,
			...source,
		};
		await createGitRepositoryGenericCluster(args);
	}

	const kustomization = data.kustomization;
	if(kustomization) {
		const sourceName = source?.name || data.selectedSource;
		await fluxTools.createKustomization(kustomization.name, sourceName, kustomization.path,
			kustomization.namespace, kustomization.targetNamespace,
			kustomization.dependsOn);
	}
	refreshAllTreeViews();
}

async function configureAzure(data: ParamsDictionary, clusterInfo: ClusterInfo) {
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
		};
		await azureTools.createSourceGit(args);
	} else if(kustomization) {
		azureTools.createKustomization(kustomization.name, data.selectedSource, kustomization.path,
			clusterInfo.contextName, clusterInfo.clusterProvider as AzureClusterProvider, kustomization.dependsOn);
	}
}
