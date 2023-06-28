import os from 'os';
import { env, extensions, version, window } from 'vscode';

import { getAzureVersion, getFluxVersion, getGitVersion, getKubectlVersion } from 'cli/checkVersions';
import { failed } from 'types/errorable';
import { GitOpsExtensionConstants } from 'types/extensionIds';

/**
 * Show all installed cli versions.
 */
export async function showInstalledVersions() {
	const [kubectlVersion, fluxVersion, gitVersion, azureVersion] = await Promise.all([
		getKubectlVersion(),
		getFluxVersion(),
		getGitVersion(),
		getAzureVersion(),
	]);

	const kubectlVersionString = failed(kubectlVersion) ? 'kubectl: not found' : `kubectl client ${kubectlVersion.result.clientVersion.gitVersion}\nkubectl server ${kubectlVersion.result.serverVersion.gitVersion}`;

	let azureVersionsString = '';
	if (failed(azureVersion)) {
		azureVersionsString = 'Azure: not found';
	} else {
		azureVersionsString = `
Azure: ${azureVersion.result['azure-cli']}
Azure extension "k8s-configuration": ${azureVersion.result.extensions['k8s-configuration'] || 'not installed'}
Azure extension "k8s-extension": ${azureVersion.result.extensions['k8s-extension'] || 'not installed'}
`.trim();
	}

	const versions = `
${kubectlVersionString}
Flux: ${failed(fluxVersion) ? 'not found' : fluxVersion.result}
Git: ${failed(gitVersion) ? 'not found' : gitVersion.result}
${azureVersionsString}
VSCode: ${version}
Extension: ${getExtensionVersion() || 'unknown'}
OS: ${getOSVersion() || 'unknown'}
`.trim();

	const copyButton = 'Copy';
	const pressedButton = await window.showInformationMessage(versions, { modal: true }, copyButton);
	if (pressedButton === copyButton) {
		env.clipboard.writeText(versions);
	}
}

/**
 * Get installed version of GitOps extension (from `package.json`).
 */
export function getExtensionVersion() {
	return extensions.getExtension(GitOpsExtensionConstants.ExtensionId)?.packageJSON.version || 'unknown version';
}
/**
 * Get Operating System its verison.
 */
function getOSVersion() {
	return `${os.type} ${os.arch} ${os.release}`;
}
