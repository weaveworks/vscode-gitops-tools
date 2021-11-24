import gitUrlParse from 'git-url-parse';
import { commands, env, Uri, window, workspace } from 'vscode';
import { azureTools } from '../azure/azureTools';
import { CommandId } from '../commands';
import { fluxTools } from '../flux/fluxTools';
import { checkIfOpenedFolderGitRepositorySourceExists } from '../git/checkIfOpenedFolderGitRepositorySourceExists';
import { checkGitVersion } from '../install';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { shell } from '../shell';
import { sanitizeRFC1123 } from '../utils/stringUtils';
import { getCurrentClusterNode, refreshSourcesTreeView, refreshWorkloadsTreeView } from '../views/treeViews';

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

	const currentClusterNode = getCurrentClusterNode();
	if (!currentClusterNode) {
		return;
	}

	const clusterProvider = await currentClusterNode.getClusterProvider();
	if (clusterProvider === ClusterProvider.Unknown) {
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

	const gitRepositoryState = await getGitRepositoryState(gitFolderFsPath, true);
	if (!gitRepositoryState) {
		return;
	}

	let gitUrl = gitRepositoryState.url;
	const gitBranch = gitRepositoryState.branch;

	const newGitRepositorySourceName = nameGitRepositorySource(gitUrl, gitBranch);

	const parsedGitUrl = gitUrlParse(gitUrl);
	const isSSH = parsedGitUrl.protocol === 'ssh';
	const isGitHub = parsedGitUrl.source === 'github.com';

	if (isSSH) {
		gitUrl = makeSSHUrlFromGitUrl(gitUrl);
	}

	let deployKey: string | undefined;

	if (clusterProvider === ClusterProvider.AKS ||
		clusterProvider === ClusterProvider.AzureARC) {

		const createGitRepoResult = await azureTools.createGitRepository(currentClusterNode, clusterProvider, newGitRepositorySourceName, gitUrl, gitBranch, isSSH);
		deployKey = createGitRepoResult?.deployKey;
		// az automatically creates a Kustomization
		refreshWorkloadsTreeView();
	} else {
		// generic cluster
		const createGitRepoResult = await fluxTools.createSourceGit(newGitRepositorySourceName, gitUrl, gitBranch, isSSH);
		deployKey = createGitRepoResult?.deployKey;
	}

	if (isSSH && deployKey) {
		if (isGitHub) {
			showGitHubDeployKeysNotification(gitUrl);
		}
		showDeployKeyNotification(deployKey);
	}

	refreshSourcesTreeView();
	checkIfOpenedFolderGitRepositorySourceExists();
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
export function nameGitRepositorySource(url: string, branch: string) {
	const parsedGitUrl = gitUrlParse(url);
	const organization = parsedGitUrl.organization;
	const repository = parsedGitUrl.name;

	return sanitizeRFC1123(`${organization}-${repository}-${branch}`);
}

/**
 * Check if provided local path is indeed a git repository.
 * @param cwd local file system path
 * @param showErrorNotifications whether or not to show error notifications
 */
async function checkIfInsideGitRepository(cwd: string, showErrorNotifications: boolean): Promise<boolean> {

	const isInsideGitRepositoryShellResult = await shell.execWithOutput('git rev-parse --is-inside-work-tree', {
		cwd,
		revealOutputView: false,
	});

	const isInsideGitRepository = isInsideGitRepositoryShellResult.code === 0;
	if (!isInsideGitRepository) {
		if (showErrorNotifications) {
			window.showErrorMessage(`Not a git repository ${cwd}`);
		}
		return false;
	}

	return true;
}

/**
 * Return git origin url
 * @param cwd local file system path
 */
export async function getGitOriginUrl(cwd: string): Promise<undefined | string> {

	const gitRemoteUrlShellResult = await shell.execWithOutput('git ls-remote --get-url origin', {
		cwd,
		revealOutputView: false,
	});

	if (gitRemoteUrlShellResult.code !== 0) {
		window.showErrorMessage(`Failed to get origin url ${gitRemoteUrlShellResult.stderr}`);
		return;
	}

	const gitOriginUrl = gitRemoteUrlShellResult.stdout.trim();
	return gitOriginUrl;
}

/**
 * Get active git branch
 * @param cwd local file system path
 */
export async function getGitBranch(cwd: string): Promise<undefined | string> {

	const gitCurrentBranchShellResult = await shell.execWithOutput('git rev-parse --abbrev-ref HEAD', {
		cwd,
		revealOutputView: false,
	});

	if (gitCurrentBranchShellResult.code !== 0) {
		window.showErrorMessage(`Failed to get current git branch ${gitCurrentBranchShellResult.stderr}`);
		return;
	}

	const gitBranch = gitCurrentBranchShellResult.stdout.trim();
	return gitBranch;
}

/**
 * Given a local file path - try to get spec properties for the Git Repository (url & branch).
 * @param cwd local file system path
 */
export async function getGitRepositoryState(cwd: string, showErrorNotifications: boolean) {

	const isInsideGitRepository = await checkIfInsideGitRepository(cwd, showErrorNotifications);
	if (!isInsideGitRepository) {
		return;
	}

	const gitUrl = await getGitOriginUrl(cwd);
	if (!gitUrl) {
		return;
	}

	const gitBranch = await getGitBranch(cwd);
	if (!gitBranch) {
		return;
	}

	return {
		url: gitUrl,
		branch: gitBranch,
	};
}

/**
 * Transform an url from `git@github.com:usernamehw/sample-k8s.git` to
 * `ssh://git@github.com/usernamehw/sample-k8s`
 * @param gitUrl target git url
 */
export function makeSSHUrlFromGitUrl(gitUrl: string): string {
	if (gitUrl.startsWith('ssh')) {
		return gitUrl;
	}

	const parsedGitUrl = gitUrlParse(gitUrl);

	const port = parsedGitUrl.port ? `:${parsedGitUrl.port}` : '';

	return `ssh://${parsedGitUrl.user}@${parsedGitUrl.source}${port}/${parsedGitUrl.full_name}`;
}
/**
 * Make a link to the "Deploy keys" page for
 * the provided GitHub repository url.
 * @param GitHub repository url
 */
export function deployKeysGitHubPage(repoUrl: string) {
	const parsedGitUrl = gitUrlParse(repoUrl);
	return `https://github.com/${parsedGitUrl.owner}/${parsedGitUrl.name}/settings/keys`;
}

async function showDeployKeyNotification(deployKey: string) {
	const copyButton = 'Copy';
	const confirm = await window.showInformationMessage(`Add deploy key to the repository: ${deployKey}`, copyButton);
	if (confirm === copyButton) {
		env.clipboard.writeText(deployKey);
	}
}

async function showGitHubDeployKeysNotification(url: string) {
	const deployKeysButton = 'Open';
	const confirm = await window.showInformationMessage('Open repository "Deploy keys" page', deployKeysButton);
	if (confirm === deployKeysButton) {
		commands.executeCommand(CommandId.VSCodeOpen, Uri.parse(deployKeysGitHubPage(url)));
	}
}
