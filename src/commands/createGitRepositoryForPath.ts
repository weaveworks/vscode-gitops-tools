import gitUrlParse from 'git-url-parse';
import { Uri, window, workspace } from 'vscode';
import { failed } from '../types/errorable';
import { getFolderGitInfo } from '../git/gitInfo';
import { checkGitVersion } from '../install';
import { getCurrentClusterInfo } from '../treeviews/treeViews';
import { openConfigureGitOpsWebview } from '../webview-backend/configureGitOps/openWebview';

/**
 * Add git repository source whether from an opened folder
 * or make user pick a folder to infer the url & branch
 * of the new git repository source.
 * @param fileExplorerUri uri of the file in the file explorer
 */
export async function createGitRepositoryForPath(fileExplorerUri?: Uri) {

	const gitInstalled = await checkGitVersion();
	if (!gitInstalled) {
		return;
	}

	const currentClusterInfo = await getCurrentClusterInfo();
	if (failed(currentClusterInfo)) {
		return;
	}

	let gitInfo;

	if (fileExplorerUri) {
		gitInfo = await getFolderGitInfo(fileExplorerUri.fsPath);
	} else {
		let gitFolderFsPath = '';
		// executed from Command Palette
		if (!workspace.workspaceFolders || workspace.workspaceFolders?.length === 0) {
			// no opened folders => show OS dialog
			const pickedFolder = await window.showOpenDialog({
				canSelectFiles: false,
				canSelectFolders: true,
				canSelectMany: false,
			});
			if (!pickedFolder) {
				return;
			}
			gitFolderFsPath = pickedFolder[0].fsPath;
		} else if (workspace.workspaceFolders.length > 1) {
			// multiple folders opened (multi-root) => make user pick one
			const pickedFolder = await window.showQuickPick(workspace.workspaceFolders.map(folder => folder.uri.fsPath));
			if (!pickedFolder) {
				return;
			}
			gitFolderFsPath = pickedFolder;
		} else {
			// just one folder opened => use it
			gitFolderFsPath = workspace.workspaceFolders[0].uri.fsPath;
		}

		gitInfo = await getFolderGitInfo(gitFolderFsPath);
	}

	openConfigureGitOpsWebview(false, '', {createWorkload: false}, gitInfo);
}
