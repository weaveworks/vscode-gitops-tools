import { Uri, window, workspace } from 'vscode';
import { getAzureMetadata } from '../getAzureMetadata';
import { checkGitVersion } from '../install';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { shell } from '../shell';
import { runTerminalCommand } from '../terminal';
import { clusterTreeViewProvider, refreshSourceTreeView } from '../views/treeViews';

/**
 * Add git repository source whether from an opened folder
 * or make user pick a folder to infer the url & branch
 * of the new git repository source.
 * @param fileExplorerUri uri of the file in the file explorer
 */
export async function addGitRepository(fileExplorerUri?: Uri) {

	const gitInstalled = await checkGitVersion();
	if (!gitInstalled) {
		return;
	}

	const currentClusterNode = clusterTreeViewProvider.getCurrentClusterNode();

	const newGitRepositorySourceName = await window.showInputBox({
		title: 'Enter a git repository name',
		validateInput: value => /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/.test(value) ? '' : `Invalid value: "${value}". A lowercase RFC 1123 subdomain must consist of lower case alphanumeric characters, '-' or '.', and must start and end with an alphanumeric character.`,
	});

	if (!newGitRepositorySourceName) {
		return;
	}

	let gitFolderFsPath = '';

	if (fileExplorerUri) {
		// executed from the VSCode File Explorer
		gitFolderFsPath = fileExplorerUri.fsPath;
	} else {
		// executed from Command Palette or from `+` button in Sources tree view
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
	}

	if (!gitFolderFsPath) {
		window.showErrorMessage('No git repository folder is picked.');
		return;
	}

	const isInsideGitRepositoryShellResult = await shell.execWithOutput('git rev-parse --is-inside-work-tree', {
		cwd: gitFolderFsPath,
		revealOutputView: false,
	});
	const isInsideGitRepository = isInsideGitRepositoryShellResult.code === 0;

	if (!isInsideGitRepository) {
		window.showErrorMessage(`Not a git repository ${gitFolderFsPath}`);
		return;
	}

	const gitRemoteUrlShellResult = await shell.execWithOutput('git ls-remote --get-url origin', {
		cwd: gitFolderFsPath,
		revealOutputView: false,
	});

	if (gitRemoteUrlShellResult.code !== 0) {
		window.showErrorMessage(`Failed to get origin url ${gitRemoteUrlShellResult.stderr}`);
		return;
	}

	const gitUrl = gitRemoteUrlShellResult.stdout.trim();

	const gitBranchesShellResult = await shell.execWithOutput('git branch --format=%(refname:short)', {
		cwd: gitFolderFsPath,
		revealOutputView: false,
	});

	if (gitBranchesShellResult.code !== 0) {
		window.showErrorMessage(`Failed to get git branches ${gitBranchesShellResult.stderr}`);
		return;
	}
	const gitBranches = gitBranchesShellResult.stdout.split('\n')
		.filter(branch => branch.length);

	let pickedGitBranch;
	if (gitBranches.length === 1) {
		pickedGitBranch = gitBranches[0];
	} else {
		pickedGitBranch = await window.showQuickPick(gitBranches, {
			title: 'Pick a git branch',
		});
		if (!pickedGitBranch) {
			return;
		}
	}

	let createGitSourceQuery = '';

	if (currentClusterNode?.clusterProvider === ClusterProvider.AKS ||
		currentClusterNode?.clusterProvider === ClusterProvider.AzureARC) {

		const azureMetadata = await getAzureMetadata(currentClusterNode.name);
		if (!azureMetadata) {
			return;
		}

		if (currentClusterNode.clusterProvider === ClusterProvider.AKS) {
			createGitSourceQuery = `az k8s-configuration flux create -g ${azureMetadata.resourceGroup} -c ${azureMetadata.clusterName} -t managedClusters --subscription ${azureMetadata.subscription} -n ${newGitRepositorySourceName} --scope cluster -u ${gitUrl} --branch ${pickedGitBranch}`;
		} else if (currentClusterNode.clusterProvider === ClusterProvider.AzureARC) {
			createGitSourceQuery = `az k8s-configuration flux create -g ${azureMetadata.resourceGroup} -c ${azureMetadata.clusterName} -t connectedClusters --subscription ${azureMetadata.subscription} -n ${newGitRepositorySourceName} --scope cluster -u ${gitUrl} --branch ${pickedGitBranch}`;
		}

	} else {
		// generic cluster
		createGitSourceQuery = `flux create source git ${newGitRepositorySourceName} --url ${gitUrl} --branch ${pickedGitBranch}`;
	}

	if (currentClusterNode?.clusterProvider === ClusterProvider.AKS ||
		currentClusterNode?.clusterProvider === ClusterProvider.AzureARC) {
		// TODO: use shell for the query
		runTerminalCommand(createGitSourceQuery, { focusTerminal: true });
	} else {
		await shell.execWithOutput(createGitSourceQuery);
		refreshSourceTreeView();
	}

}
