import os from 'os';
import { env, extensions, version, window } from 'vscode';
import { getAzureVersion, getFluxVersion, getGitVersion, getKubectlVersion } from '../install';

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

	const kubectlVersionString = kubectlVersion ? kubectlVersion.trim()
		.split('\n')
		.map(ver => `kubectl ${ver}`)
		.join('\n') : 'not found';

	const azureVersionsString = azureVersion ? `
Azure: ${azureVersion?.['azure-cli']}
Azure extension "k8s-configuration": ${azureVersion.extensions['k8s-configuration']}
Azure extension "k8s-extension": ${azureVersion.extensions['k8s-extension']}
	`.trim() : 'not found';

	const versions = `
${kubectlVersionString}
Flux: ${fluxVersion || 'not found'}
Git: ${gitVersion?.trim() || 'not found'}
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
function getExtensionVersion() {
	return extensions.getExtension('weaveworks.vscode-gitops-tools')?.packageJSON.version;
}
/**
 * Get Operating System its verison.
 */
function getOSVersion() {
	return `${os.type} ${os.release}`;
}
