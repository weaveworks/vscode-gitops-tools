import { Uri, window } from 'vscode';
import { fluxTools } from '../cli/flux/fluxTools';
import { getFolderGitInfo, getGitRepositoryforGitInfo } from '../cli/git/gitInfo';

/**
 * Command to reconcile GitRepository for selected file
 */
export async function fluxReconcileRepositoryForPath(fileExplorerUri?: Uri) {
	if(!fileExplorerUri) {
		return;
	}

	const gitInfo = await getFolderGitInfo(fileExplorerUri.fsPath);
	const gr = await getGitRepositoryforGitInfo(gitInfo);

	if(!gr?.metadata?.name || !gr.metadata?.namespace) {
		window.showWarningMessage(`No GitRepository with url '${gitInfo?.url}'`);
		return;
	}

	await fluxTools.reconcile('source git', gr.metadata.name, gr.metadata.namespace);
}
