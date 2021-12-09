import path from 'path';
import { Uri, window, workspace } from 'vscode';
import { fluxTools } from '../flux/fluxTools';
import { checkIfOpenedFolderGitRepositorySourceExists } from '../git/checkIfOpenedFolderGitRepositorySourceExists';
import { refreshWorkloadsTreeView } from '../views/treeViews';
import { addGitRepository } from './addGitRepository';

/**
 * Create kustomization from File Explorer context menu
 * or `+` button or Command Palette.
 *
 * @param fileExplorerUri uri of the file in the file explorer
 */
export async function addKustomization(fileExplorerUri?: Uri) {
	let kustomizationFsPath = '';
	let relativeKustomizationPath = '';
	/** Use this fsPath to create Git Repository when it doesn't exist  */
	let workspaceFolderUri;

	if (fileExplorerUri) {
		// executed from the VSCode File Explorer
		kustomizationFsPath = fileExplorerUri.fsPath;
	} else {
		// executed from Command Palette or from `+` button in Workloads tree view
		// TODO: handle when no folder is opened?
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
		workspaceFolderUri = pickedFolder[0];
	}

	// get relative path for the kustomization
	for (const folder of workspace.workspaceFolders || []) {
		const relativePath = path.relative(folder.uri.fsPath, kustomizationFsPath);
		if (relativePath && !relativePath.startsWith('..') && !path.isAbsolute(relativePath)) {
			relativeKustomizationPath = relativePath;
			break;
		}
	}

	let gitSourceExists = await checkIfOpenedFolderGitRepositorySourceExists();
	let gitRepositoryName = gitSourceExists?.gitRepositoryName;

	if (!gitSourceExists) {
		const createGitSourceButton = 'Create Git Repository';
		const modalResult = await window.showWarningMessage('Git repository source does not exist yet.', {
			modal: true,
		}, createGitSourceButton);
		if (modalResult !== createGitSourceButton) {
			return;
		}

		gitRepositoryName = await addGitRepository(workspaceFolderUri);
	}

	if (!gitRepositoryName) {
		window.showErrorMessage('Failed to get Git Repository Name');
		return;
	}

	let newKustomizationName = await window.showInputBox({
		title: 'Kustomization Name',
		value: `${gitRepositoryName}-kustomization`,
		validateInput: value => /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/.test(value) ? '' : `Invalid value: "${value}". A lowercase RFC 1123 subdomain must consist of lower case alphanumeric characters, '-' or '.', and must start and end with an alphanumeric character.`,
	});

	if (!newKustomizationName) {
		newKustomizationName = gitRepositoryName;
	}

	await fluxTools.createKustomization(newKustomizationName, gitRepositoryName, relativeKustomizationPath);

	refreshWorkloadsTreeView();
}
