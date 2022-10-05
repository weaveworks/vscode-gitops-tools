import gitUrlParse from 'git-url-parse';
import { Uri } from 'vscode';
import { getGitRepositoryState, nameGitRepositorySource } from '../commands/createGitRepository';
import { makeSSHUrlFromGitUrl } from '../commands/createSource';
import { checkGitVersion } from '../install';

export interface GitInfo {
	name: string;
	url: string;
	branch: string;
}

/**
 * Try to infer git remote url & branch. Also make a name for the
 * new git repository according to RFC 1123 subdomain.
 */
export async function getOpenedFolderGitInfo(targetFolderUri: Uri): Promise<GitInfo | undefined> {
	const gitInstalled = await checkGitVersion();
	if (!gitInstalled) {
		return;
	}

	const gitRepositoryState = await getGitRepositoryState(targetFolderUri.fsPath, true);
	if (!gitRepositoryState) {
		return;
	}

	let gitUrl = gitRepositoryState.url;
	const gitBranch = gitRepositoryState.branch;

	const newGitRepositorySourceName = nameGitRepositorySource(gitUrl, gitBranch);
	const parsedGitUrl = gitUrlParse(gitUrl);

	if (parsedGitUrl.protocol === 'ssh') {
		gitUrl = makeSSHUrlFromGitUrl(gitUrl);
	}

	return {
		name: newGitRepositorySourceName,
		url: gitUrl,
		branch: gitBranch,
	};
}
