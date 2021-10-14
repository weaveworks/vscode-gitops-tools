import path from 'path';
import semverGt from 'semver/functions/gt';
import semverSatisfies from 'semver/functions/satisfies';
import { commands, Uri, window } from 'vscode';
import { checkGitVersion } from '../install';
import { shell } from '../shell';
import { quoteFsPath } from '../utils/fsUtils';
import { GitRepositoryNode } from '../views/nodes/gitRepositoryNode';

/**
 * Clone git source repository to user machine from
 * git repository source node.
 * @param sourceNode target source node
 */
export async function pullGitRepository(sourceNode: GitRepositoryNode): Promise<void> {
	const gitInstalled = await checkGitVersion();
	if (!gitInstalled) {
		return;
	}

	// allow user to pick one folder
	const pickedFolder = await window.showOpenDialog({
		canSelectFiles: false,
		canSelectFolders: true,
		canSelectMany: false,
		title: 'Pick a folder to pull the git repository into.',
	});

	if (!pickedFolder) {
		return;
	}

	const pickedFolderFsPath = path.join(pickedFolder[0].fsPath, sourceNode.resource.metadata.name || 'gitRepository');

	// precedence - commit > semver > tag > branch
	const url = sourceNode.resource.spec.url;
	const commit = sourceNode.resource.spec.ref?.commit;
	const semver = sourceNode.resource.spec.ref?.semver;
	const branchOrTag = sourceNode.resource.spec.ref?.tag || sourceNode.resource.spec.ref?.branch;

	let branchArg = '';
	if (commit) {
		// checkout to commit later
	} else if (semver) {
		// get latest tag that satisfies the semver range of versions
		const latestTag = await getLatestTagFromSemver(url, semver);
		if (latestTag) {
			branchArg = `--branch ${latestTag}`;
		}
	} else if (branchOrTag) {
		// use branch or tag from the spec
		branchArg = `--branch ${branchOrTag}`;
	}

	// https://git-scm.com/docs/git-clone
	const query = `git clone ${branchArg} ${url} ${quoteFsPath(pickedFolderFsPath)}`;
	const gitCloneShellResult = await shell.execWithOutput(query);

	if (gitCloneShellResult.code !== 0) {
		window.showErrorMessage(gitCloneShellResult?.stderr || '');
		return;
	}

	// can only do checkout after the repository was cloned
	if (commit) {
		await shell.exec(`git checkout ${commit}`, {
			cwd: pickedFolderFsPath,
		});
	}

	const openFolderButton = 'Open Folder';
	const openFolderConfirm = await window.showInformationMessage('Repository pulled successfully.', openFolderButton);
	if (openFolderConfirm === openFolderButton) {
		commands.executeCommand('vscode.openFolder', Uri.file(pickedFolderFsPath));
	}
}

/**
 * Get latest tag that satisfies the semver range of versions
 * @param url Git source spec url
 * @param semver A range of versions to target
 * @returns Latest tag that satisfies the semver range or `undefined`
 */
async function getLatestTagFromSemver(url: string, semver: string): Promise<string | undefined> {
	const tagsShellResult = await shell.exec(`git ls-remote --tags ${url}`);

	if (tagsShellResult?.code !== 0) {
		window.showWarningMessage(`Failed to get tags from ${url}`);
		return;
	}

	const tags = tagsShellResult.stdout.split('\n')
		.map(tag => tag.split('\t')?.[1]?.slice(10) || '')
		.filter(tag => tag.length);

	if (!tags.length) {
		window.showWarningMessage(`No tags found in ${url}`);
		return;
	}

	const sortedBySemverTags = tags.sort((tag1, tag2) => semverGt(tag1, tag2) ? -1 : 1);

	for (const tag of sortedBySemverTags) {
		if (semverSatisfies(tag, semver)) {
			return tag;
		}
	}
}
