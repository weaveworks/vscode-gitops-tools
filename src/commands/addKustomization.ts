import path from 'path';
import { Uri, window, workspace } from 'vscode';
import { azureTools, isAzureProvider } from '../azure/azureTools';
import { fluxTools } from '../flux/fluxTools';
import { validateKustomizationName } from '../flux/fluxUtils';
import { checkIfOpenedFolderGitRepositorySourceExists } from '../git/checkIfOpenedFolderGitRepositorySourceExists';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { getCurrentClusterNode, refreshWorkloadsTreeView } from '../views/treeViews';
import { addGitRepository } from './addGitRepository';

/**
 * Create kustomization from File Explorer context menu
 * or `+` button or Command Palette.
 *
 * @param fileExplorerUri uri of the file in the file explorer
 */
export async function addKustomization(fileExplorerUri?: Uri) {

	const currentClusterNode = getCurrentClusterNode();
	if (!currentClusterNode) {
		return;
	}

	const clusterProvider = await currentClusterNode.getClusterProvider();
	if (clusterProvider === ClusterProvider.Unknown) {
		return;
	}

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

	const isAzure = isAzureProvider(clusterProvider);

	// TODO: when source doesn't exist - it needs different handling for azure provider (azure automatically creates a Kustomization)

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
		value: isAzure ? '' : `${gitRepositoryName}-kustomization`,
		validateInput: value => validateKustomizationName(value, gitRepositoryName, isAzure),
	});

	if (newKustomizationName === undefined) {
		return;
	}

	if (!newKustomizationName) {
		newKustomizationName = gitRepositoryName;
	}

	if (isAzureProvider(clusterProvider)) {
		await azureTools.createKustomization(newKustomizationName, gitRepositoryName, relativeKustomizationPath, currentClusterNode, clusterProvider);
	} else {
		await fluxTools.createKustomization(newKustomizationName, gitRepositoryName, relativeKustomizationPath);
	}

	refreshWorkloadsTreeView();
}
