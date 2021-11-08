import gitUrlParse from 'git-url-parse';
import { Uri, window, workspace } from 'vscode';
import { getAzureMetadata } from '../getAzureMetadata';
import { checkGitVersion } from '../install';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { shell } from '../shell';
import { runTerminalCommand } from '../terminal';
import { sanitizeRFC1123 } from '../utils/stringUtils';
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

	const gitCurrentBranchShellResult = await shell.execWithOutput('git rev-parse --abbrev-ref HEAD', {
		cwd: gitFolderFsPath,
		revealOutputView: false,
	});

	if (gitCurrentBranchShellResult.code !== 0) {
		window.showErrorMessage(`Failed to get current git branch ${gitCurrentBranchShellResult.stderr}`);
		return;
	}
	const gitBranch = gitCurrentBranchShellResult.stdout.trim();

	const newGitRepositorySourceName = nameGitRepositorySource(gitUrl, gitBranch);

	let createGitSourceQuery = '';

	if (currentClusterNode?.clusterProvider === ClusterProvider.AKS ||
		currentClusterNode?.clusterProvider === ClusterProvider.AzureARC) {

		const azureMetadata = await getAzureMetadata(currentClusterNode.name);
		if (!azureMetadata) {
			return;
		}

		createGitSourceQuery = `az k8s-configuration flux create -g ${azureMetadata.resourceGroup} -c ${azureMetadata.clusterName} -t ${currentClusterNode.clusterProvider === ClusterProvider.AKS ? 'managedClusters' : 'connectedClusters'} --subscription ${azureMetadata.subscription} -n ${newGitRepositorySourceName} --scope cluster -u ${gitUrl} --branch ${gitBranch}`;
	} else {
		// generic cluster
		createGitSourceQuery = `flux create source git ${newGitRepositorySourceName} --url ${gitUrl} --branch ${gitBranch}`;
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

/**
 * Use naming convention for the newly created git repository source:
 *
 * ```ts
 * `${organization}-${repository}-${branch}`
 * ```
 *
 * The source name should comply with RFC 1123.
 *
 * @param url git url string, for example `https://github.com/murillodigital/team-ssp` or
 * `git@github.com:fluxcd/source-controller.git`
 * @param branch active git branch name
 */
function nameGitRepositorySource(url: string, branch: string) {
	const parsedGitUrl = gitUrlParse(url);
	const organization = parsedGitUrl.organization;
	const repository = parsedGitUrl.name;

	return sanitizeRFC1123(`${organization}-${repository}-${branch}`);
}
