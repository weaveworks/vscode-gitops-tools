import { window, workspace } from 'vscode';
import { failed } from '../../errorable';
import { telemetry } from '../../extension';
import { getExtensionContext } from '../../extensionContext';
import { getOpenedFolderGitInfo, GitInfo } from '../../git/getOpenedFolderGitInfo';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { ClusterProvider } from '../../kubernetes/types/kubernetesTypes';
import { TelemetryEventNames } from '../../telemetry';
import { getCurrentClusterInfo } from '../../views/treeViews';
import { createOrShowConfigureGitOpsPanel } from './Panel';

/**
 * Open the webview editor with a form to enter all the flags
 * needed to create a source (and possibly Kustomization)
 */
export async function openConfigureGitOpsPanel(selectSource: boolean, selectedSource?: string) {
	telemetry.send(TelemetryEventNames.CreateSourceOpenWebview);

	const clusterInfo = await getCurrentClusterInfo();
	if (failed(clusterInfo)) {
		return;
	}
	if (clusterInfo.result.clusterProvider === ClusterProvider.Unknown) {
		window.showErrorMessage('Cluster provider is not detected ');
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

	const [nsResults, grResults, orResults] = await Promise.all([kubernetesTools.getNamespaces(), kubernetesTools.getGitRepositories(), kubernetesTools.getOciRepositories()]);
	const namespaces = nsResults?.items.map(i => i.metadata.name) as string[];
	const gitSources = grResults?.items.map(i => i.metadata.name) as string[];
	const ociSources = orResults?.items.map(i => i.metadata.name) as string[];

	const sources: string[] = [];
	gitSources.forEach(name => sources.push(`GitRepository/${name}`));
	ociSources.forEach(name => sources.push(`OCIRepository/${name}`));

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
