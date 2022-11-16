import { window } from 'vscode';
import { ClusterProvider } from '../kubernetes/types/kubernetesTypes';
import { shell } from '../shell';
import { AzureClusterProvider } from './azureTools';

/**
	 * Return true if all prerequisites for installing Azure cluster extension 'microsoft.flux' are ready
	 */
export async function checkAzurePrerequisites(clusterProvider: AzureClusterProvider): Promise<boolean> {
	if(clusterProvider === ClusterProvider.AKS) {
		const results = await Promise.all([
			checkPrerequistesProviders(),
			checkPrerequistesCliExtensions(),
			checkPrerequistesFeatures(),
		]);

		return (results[0] && results[1] && results[2]);
	} else {
		const results = await Promise.all([
			checkPrerequistesProviders(),
			checkPrerequistesCliExtensions(),
		]);

		return (results[0] && results[1]);
	}
}

async function checkPrerequistesFeatures(): Promise<boolean> {
	const result = await shell.execWithOutput('az feature show --namespace Microsoft.ContainerService -n AKS-ExtensionManager');
	const success = result.stdout.includes('"state": "Registered"');

	if(!success) {
		window.showWarningMessage('Missing Azure Prerequisite: Feature \'Microsoft.ContainerService\AKS-ExtensionManager\'', 'OK');
	}

	return success;
}

async function checkPrerequistesProviders(): Promise<boolean> {
	const result = await shell.execWithOutput('az provider list -o table');
	const lines = result.stdout.replace(/\r\n/g,'\n').split('\n');

	let registeredCompontents = 0;
	for(let line of lines) {
		if(/^Microsoft.Kubernetes\b.*\bRegistered\b/.test(line)) {
			registeredCompontents++;
		} else {
			window.showWarningMessage('Missing Azure Prerequisite: Provider \'Microsoft.Kubernetes\'', 'OK');
		}
		if(/^Microsoft.KubernetesConfiguration\b.*\bRegistered\b/.test(line)) {
			registeredCompontents++;
		} else {
			window.showWarningMessage('Missing Azure Prerequisite: Provider \'Microsoft.KubernetesConfiguration\'', 'OK');
		}
		if(/^Microsoft.ContainerService\b.*\bRegistered\b/.test(line)) {
			registeredCompontents++;
		} else {
			window.showWarningMessage('Missing Azure Prerequisite: Provider \'Microsoft.ContainerService\'', 'OK');
		}
	}

	return registeredCompontents === 3;
}

async function checkPrerequistesCliExtensions(): Promise<boolean> {
	const result = await shell.execWithOutput('az extension list -o table');

	const configurationSuccess = result.stdout.includes('k8s-configuration');
	if(!configurationSuccess) {
		window.showWarningMessage('Missing Azure Prerequisite: az CLI extension \'k8s-configuration\'', 'OK');
	}

	const extensionSuccess = result.stdout.includes('k8s-extension');
	if(!extensionSuccess) {
		window.showWarningMessage('Missing Azure Prerequisite: az CLI extension \'k8s-extension\'', 'OK');
	}

	return configurationSuccess && extensionSuccess;
}
