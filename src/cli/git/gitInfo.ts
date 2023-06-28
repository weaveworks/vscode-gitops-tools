import gitUrlParse from 'git-url-parse';
import path from 'path';
import { window } from 'vscode';

import { checkGitVersion } from 'cli/checkVersions';
import { shell } from 'cli/shell/exec';
import { makeSSHUrlFromGitUrl } from 'commands/createSource';
import { GitRepository } from 'types/flux/gitRepository';
import { getGitRepositories } from 'cli/kubernetes/kubectlGet';


export interface GitInfo {
	name: string;
	url: string;
	branch: string;
}

export async function getGitRepositoryforPath(fsPath: string) {
	const gitInfo = await getFolderGitInfo(fsPath);
	return getGitRepositoryforGitInfo(gitInfo);
}

export async function getGitRepositoryforGitInfo(gitInfo?: GitInfo): Promise<GitRepository | undefined> {
	if(!gitInfo) {
		return;
	}

	const gitRepositories = await getGitRepositories();
	return gitRepositories.find(gr => gr.spec.url === gitInfo.url);
}

/**
 * Find the root workspace folder. Try to infer git remote url & branch. Also make a name for the
 * new git repository according to RFC 1123 subdomain.
 */
export async function getFolderGitInfo(fsPath: string): Promise<GitInfo | undefined> {
	const gitInstalled = await checkGitVersion();
	if (!gitInstalled) {
		return;
	}

	// turn file path to folder path
	fsPath = path.dirname(fsPath);

	const gitRepositoryState = await getGitRepositoryState(fsPath, false);
	if (!gitRepositoryState) {
		return;
	}

	let gitUrl = gitRepositoryState.url;
	const gitBranch = gitRepositoryState.branch;

	const parsedGitUrl = gitUrlParse(gitUrl);

	if (parsedGitUrl.protocol === 'ssh') {
		gitUrl = makeSSHUrlFromGitUrl(gitUrl);
	}

	return {
		name: parsedGitUrl.name.toLowerCase(),
		url: gitUrl,
		branch: gitBranch,
	};
}



/**
 * Check if provided local path is indeed a git repository.
 * @param cwd local file system path
 * @param showErrorNotifications whether or not to show error notifications
 */
async function checkIfInsideGitRepository(cwd: string, showErrorNotifications: boolean): Promise<boolean> {

	const isInsideGitRepositoryShellResult = await shell.exec('git rev-parse --is-inside-work-tree', {
		cwd,
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

	const gitRemoteUrlShellResult = await shell.exec('git ls-remote --get-url origin', {
		cwd,
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

	const gitCurrentBranchShellResult = await shell.exec('git rev-parse --abbrev-ref HEAD', {
		cwd,
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


