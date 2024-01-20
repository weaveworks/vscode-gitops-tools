import { Uri, window, workspace } from 'vscode';

import { GitInfo, getFolderGitInfo } from 'cli/git/gitInfo';
import { extensionContext, telemetry } from 'extension';
import { failed } from 'types/errorable';
import { FluxSourceObject } from 'types/flux/object';
import { ClusterProvider } from 'types/kubernetes/clusterProvider';
import { KubernetesObject } from 'types/kubernetes/kubernetesTypes';
import { TelemetryEvent } from 'types/telemetryEventNames';
import { getCurrentClusterInfo } from 'ui/treeviews/treeViews';
import { namespacedFluxObject } from 'utils/namespacedFluxObject';
import { WebviewBackend } from '../WebviewBackend';

import { getBuckets, getGitRepositories, getOciRepositories } from 'cli/kubernetes/kubectlGet';
import { getNamespaces } from 'cli/kubernetes/kubectlGetNamespace';
import { ConfigureGitOpsWebviewParams } from 'types/webviewParams';
import { receiveMessage } from './receiveMessage';

let webview: WebviewBackend | undefined;

/**
 * Open the webview editor with a form to enter all the flags
 * needed to create a source (and possibly Kustomization)
 */
export async function openConfigureGitOpsWebview(selectSource: boolean, selectedSource?: FluxSourceObject | string, set?: any, gitInfo?: GitInfo) {
	telemetry.send(TelemetryEvent.CreateSourceOpenWebview);

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

	if (!gitInfo && workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
		// use the first open folder
		gitInfo = await getFolderGitInfo(workspace.workspaceFolders[0].uri.fsPath);
	}

	const [nsResults, gitResults, ociResults, bucketResults] = await Promise.all([
		getNamespaces(),
		getGitRepositories(),
		getOciRepositories(),
		getBuckets(),
	]);

	const namespaces = nsResults.map(i => i.metadata.name) as string[];

	const sources: KubernetesObject[] = [
		...gitResults,
		...ociResults,
		...bucketResults,
	];

	const selectedSourceName = typeof selectedSource === 'string' ? selectedSource : (namespacedFluxObject(selectedSource) || '');

	const webviewParams: ConfigureGitOpsWebviewParams = {
		clusterInfo: clusterInfo.result,
		gitInfo,
		namespaces: namespaces,
		sources: sources,
		selectSourceTab: selectSource,
		selectedSource: selectedSourceName,
		set,
	};


	if(!webview || webview.disposed) {
		const extensionUri = extensionContext.extensionUri;
		const uri = Uri.joinPath(extensionUri, 'webview-ui', 'configureGitOps');
		webview = new WebviewBackend('Configure GitOps', uri, webviewParams, receiveMessage);
	} else {
		webview.update(webviewParams);
	}
}
