import gitUrlParse from 'git-url-parse';
import { commands, env, Uri, window } from 'vscode';
import { azureTools } from '../azure/azureTools';
import { CommandId } from '../commands';


/**
 * Show notifications reminding users to add a public key
 * to the git repository (when the url uses SSH protocol).
 */
export function showDeployKeyNotificationIfNeeded(url: string, deployKey?: string) {
	if (!deployKey) {
		return;
	}

	const parsedGitUrl = gitUrlParse(url);
	const isSSH = parsedGitUrl.protocol === 'ssh';
	const isGitHub = isUrlSourceGitHub(parsedGitUrl.source);
	const isAzureDevops = isUrlSourceAzureDevops(parsedGitUrl.source);

	if (isSSH && deployKey) {
		if (isGitHub) {
			showDeployKeysPageNotification(Uri.parse(deployKeysGitHubPage(url)));
		} else if (isAzureDevops) {
			showDeployKeysPageNotification(Uri.parse(deployKeysAzureDevopsPage(url)));
		}
		showDeployKeyNotification(deployKey);
	}
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

	return `ssh://${parsedGitUrl.user}@${parsedGitUrl.resource}${parsedGitUrl.pathname}`;
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
/**
 * Make a link to the "SSH Public Keys" page for
 * the provided Azure Devops repository url.
 * @param GitHub repository url
 */
export function deployKeysAzureDevopsPage(repoUrl: string) {
	const parsedGitUrl = gitUrlParse(repoUrl);
	return `https://dev.azure.com/${parsedGitUrl.name}/_usersSettings/keys`;
}

export async function showDeployKeyNotification(deployKey: string) {
	const copyButton = 'Copy';
	const confirm = await window.showInformationMessage(`Add deploy key to the repository: ${deployKey}`, copyButton);
	if (confirm === copyButton) {
		env.clipboard.writeText(deployKey);
	}
}

export async function showDeployKeysPageNotification(uri: Uri) {
	const deployKeysButton = 'Open';
	const confirm = await window.showInformationMessage('Open repository "Deploy keys" page', deployKeysButton);
	if (confirm === deployKeysButton) {
		commands.executeCommand(CommandId.VSCodeOpen, uri);
	}
}

export function isUrlSourceAzureDevops(urlSource: string) {
	return urlSource === 'dev.azure.com';
}
export function isUrlSourceGitHub(urlSource: string) {
	return urlSource === 'github.com';
}
