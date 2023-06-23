import path from 'path';
import { Uri, window, workspace } from 'vscode';
import { failed } from '../types/errorable';
import { getFolderGitInfo, getGitRepositoryforGitInfo } from '../git/gitInfo';
import { namespacedObject } from '../types/flux/object';
import { getCurrentClusterInfo } from '../treeviews/treeViews';
import { openConfigureGitOpsWebview } from '../webview-backend/configureGitOps/openWebview';

/**
 * Create kustomization from File Explorer context menu
 * or `+` button or Command Palette.
 *
 * @param fileExplorerUri uri of the file in the file explorer
 */
export async function createKustomizationForPath(fileExplorerUri?: Uri): Promise<void> {

	const currentClusterInfo = await getCurrentClusterInfo();
	if (failed(currentClusterInfo)) {
		return;
	}

	let kustomizationFsPath = '';
	let relativeKustomizationPath = '';

	if (fileExplorerUri) {
		// executed from the VSCode File Explorer
		kustomizationFsPath = fileExplorerUri.fsPath;
	} else {
		// executed from Command Palette
		const pickedFolder = await window.showOpenDialog({
			title: 'Select a folder (used for "path" property on the new Kustomization object)',
			canSelectFiles: false,
			canSelectFolders: true,
			canSelectMany: false,
			defaultUri: workspace.workspaceFolders?.[0].uri,
		});
		if (!pickedFolder) {
			return;
		}
		kustomizationFsPath = pickedFolder[0].fsPath;
	}

	// get relative path for the kustomization
	for (const folder of workspace.workspaceFolders || []) {
		const relativePath = path.relative(folder.uri.fsPath, kustomizationFsPath);
		if (relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)) {
			relativeKustomizationPath = relativePath;
			break;
		}
	}

	const gitInfo = await getFolderGitInfo(kustomizationFsPath);
	const gr = await getGitRepositoryforGitInfo(gitInfo);

	const selectSource = !!gr;
	let sourceName = namespacedObject(gr) || '';

	openConfigureGitOpsWebview(selectSource, sourceName, {
		kustomization: {
			path: relativeKustomizationPath,
		},
		createWorkload: true,
	}, gitInfo);

}

