import gitUrlParse from 'git-url-parse';
import { commands, env, Uri, window } from 'vscode';
import { AzureClusterProvider, azureTools } from '../azure/azureTools';
import { CommandId } from '../commands';
import { fluxTools } from '../flux/fluxTools';
import { refreshSourcesTreeView, refreshWorkloadsTreeView } from '../views/treeViews';

export async function createGitRepositoryGenericCluster(args: Parameters<typeof fluxTools['createSourceGit2']>[0]) {
	const deployKey = await fluxTools.createSourceGit2({
		sourceName: args.sourceName,
		url: args.url,
		branch: args.branch,
		semver: args.semver,
		tag: args.tag,
		interval: args.interval,
		timeout: args.timeout,
		caFile: args.caFile,
		username: args.username,
		password: args.password,
		privateKeyFile: args.privateKeyFile,
		secretRef: args.secretRef,
		gitImplementation: args.gitImplementation,
		recurseSubmodules: args.recurseSubmodules,
		sshKeyAlgorithm: args.sshKeyAlgorithm,
		sshEcdsaCurve: args.sshEcdsaCurve,
		sshRsaBits: args.sshRsaBits,
	});

	refreshSourcesTreeView();
	showDeployKeyNotificationIfNeeded(args.url, deployKey?.deployKey);
}

export async function createGitRepositoryAzureCluster(args: Parameters<typeof azureTools['createSourceGit2']>[0]) {
	const deployKey = await azureTools.createSourceGit2({
		clusterProvider: args.clusterProvider as AzureClusterProvider,
		contextName: args.contextName,
		sourceName: args.sourceName,
		sourceKind: 'git',
		url: args.url,
		branch: args.branch,
		tag: args.tag,
		semver: args.semver,
		commit: args.commit,
		interval: args.interval,
		timeout: args.timeout,
		caCert: args.caCert,
		caCertFile: args.caCertFile,
		httpsUser: args.httpsUser,
		httpsKey: args.httpsKey,
		knownHosts: args.knownHosts,
		knownHostsFile: args.knownHostsFile,
		localAuthRef: args.localAuthRef,
		sshPrivateKey: args.sshPrivateKey,
		sshPrivateKeyFile: args.sshPrivateKeyFile,
		kustomizationName: args.kustomizationName,
		kustomizationPath: args.kustomizationPath,
		kustomizationDependsOn: args.kustomizationDependsOn,
		kustomizationTimeout: args.kustomizationTimeout,
		kustomizationSyncInterval: args.kustomizationSyncInterval,
		kustomizationRetryInterval: args.kustomizationRetryInterval,
		kustomizationPrune: args.kustomizationPrune,
		kustomizationForce: args.kustomizationForce,
	});

	refreshSourcesTreeView();
	refreshWorkloadsTreeView();
	showDeployKeyNotificationIfNeeded(args.url, deployKey?.deployKey);
}

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
	const isGitHub = parsedGitUrl.source === 'github.com';

	if (isSSH && deployKey) {
		if (isGitHub) {
			showGitHubDeployKeysNotification(url);
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

export async function showDeployKeyNotification(deployKey: string) {
	const copyButton = 'Copy';
	const confirm = await window.showInformationMessage(`Add deploy key to the repository: ${deployKey}`, copyButton);
	if (confirm === copyButton) {
		env.clipboard.writeText(deployKey);
	}
}

export async function showGitHubDeployKeysNotification(url: string) {
	const deployKeysButton = 'Open';
	const confirm = await window.showInformationMessage('Open repository "Deploy keys" page', deployKeysButton);
	if (confirm === deployKeysButton) {
		commands.executeCommand(CommandId.VSCodeOpen, Uri.parse(deployKeysGitHubPage(url)));
	}
}
