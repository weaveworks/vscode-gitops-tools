import { Uri, window, workspace } from 'vscode';
import { failed } from '../../errorable';
import { telemetry } from '../../extension';
import { getExtensionContext } from '../../extensionContext';
import { getFolderGitInfo, GitInfo } from '../../git/gitInfo';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { FluxSourceObject, namespacedObject } from '../../kubernetes/types/flux/object';
import { ClusterProvider, KubernetesObject } from '../../kubernetes/types/kubernetesTypes';
import { TelemetryEventNames } from '../../telemetry';
import { getCurrentClusterInfo } from '../../views/treeViews';
import { WebviewBackend } from '../WebviewBackend';

import { ConfigureGitOpsWebviewParams } from '../types';
import { receiveMessage } from './receiveMessage';

let webview: WebviewBackend | undefined;

/**
 * Open the webview editor with a form to enter all the flags
 * needed to create a source (and possibly Kustomization)
 */
export async function openConfigureGitOpsWebview(selectSource: boolean, selectedSource?: FluxSourceObject | string, set?: any, gitInfo?: GitInfo) {
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

	if (!gitInfo && workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
		// use the first open folder
		gitInfo = await getFolderGitInfo(workspace.workspaceFolders[0].uri.fsPath);
	}

	const [nsResults, gitResults, ociResults, bucketResults] = await Promise.all([kubernetesTools.getNamespaces(),
		kubernetesTools.getGitRepositories(),
		kubernetesTools.getOciRepositories(),
		kubernetesTools.getBuckets(),
	]);

	const namespaces = nsResults?.items.map(i => i.metadata.name) as string[];

	const sources: KubernetesObject[] = [...gitResults?.items || [],
									 ...ociResults?.items || [],
									 ...bucketResults?.items || []];

	const selectedSourceName = typeof selectedSource === 'string' ? selectedSource : (namespacedObject(selectedSource) || '');

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
		const extensionUri = getExtensionContext().extensionUri;
		const uri = Uri.joinPath(extensionUri, 'webview-ui', 'configureGitOps');
		webview = new WebviewBackend('Configure GitOps', uri, webviewParams, receiveMessage);
	} else {
		webview.update(webviewParams);
	}
}
