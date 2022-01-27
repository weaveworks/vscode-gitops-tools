import { window, workspace } from 'vscode';
import { failed } from '../errorable';
import { telemetry } from '../extension';
import { getExtensionContext } from '../extensionContext';
import { getOpenedFolderGitInfo, GitInfo } from '../git/getOpenedFolderGitInfo';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { TelemetryEventNames } from '../telemetry';
import { getCurrentClusterInfo } from '../views/treeViews';
import { CreateSourcePanel } from '../webviews/createSourceWebview';

/**
 * Open the webview editor with a form to enter all the flags
 * needed to create a source (and possibly Kustomization
 * if the current cluster is Azure)
 *
 * Also prefill new git source name/branch/url if possible.
 */
export async function openCreateSourceWebview() {

	telemetry.send(TelemetryEventNames.CreateSourceOpenWebview);

	const currentClusterInfo = await getCurrentClusterInfo();
	if (failed(currentClusterInfo)) {
		return;
	}
	if (currentClusterInfo.result.clusterProvider === ClusterProvider.Unknown) {
		window.showErrorMessage('Cluster provider is not detected yet.');
		return;
	}
	if (currentClusterInfo.result.clusterProvider === ClusterProvider.DetectionFailed) {
		// TODO: add actual error message if detection is Errorable
		window.showErrorMessage('Cluster provider detection failed.');
		return;
	}

	let gitInfo: GitInfo | undefined;
	if (workspace.workspaceFolders && workspace.workspaceFolders.length === 1) {
		// if only 1 folder is opened - get git remote url & branch & new source name
		gitInfo = await getOpenedFolderGitInfo(workspace.workspaceFolders[0].uri);
	}

	CreateSourcePanel.createOrShow(getExtensionContext().extensionUri, currentClusterInfo.result, gitInfo);
}
