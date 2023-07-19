import { window, workspace } from 'vscode';
import * as kubernetes from 'vscode-kubernetes-tools-api';

import { output } from 'cli/shell/output';
import { telemetry } from 'extension';
import { TelemetryError } from 'types/telemetryEventNames';

/**
 * Defines Kubernetes Tools class for integration
 * with Microsoft Kubernetes Tools extension API.
 * @see https://github.com/Azure/vscode-kubernetes-tools
 * @see https://github.com/Azure/vscode-kubernetes-tools-api
 */

export let kubectlApi: kubernetes.KubectlV1 | undefined;

/**
 * Gets kubernetes tools extension kubectl api reference.
 * @see https://github.com/Azure/vscode-kubernetes-tools-api
 */
async function getKubectlApi() {
	if (kubectlApi) {
		return kubectlApi;
	}

	const kubectl = await kubernetes.extension.kubectl.v1;
	if (!kubectl.available) {
		window.showErrorMessage(`Kubernetes Tools Kubectl API is unavailable: ${kubectl.reason}`);
		telemetry.sendError(TelemetryError.KUBERNETES_TOOLS_API_UNAVAILABLE, new Error(kubectl.reason));
		return;
	}
	kubectlApi = kubectl.api;
	return kubectlApi;
}

/**
 * Invokes kubectl command via Kubernetes Tools API.
 * @param command Kubectl command to run.
 * @returns Kubectl command results.
 */
export async function invokeKubectlCommand(command: string, printOutput = true): Promise<kubernetes.KubectlV1.ShellResult | undefined> {
	const kubectl = await getKubectlApi();
	if (!kubectl) {
		return;
	}

	let kubectlShellResult;
	const commandWithArgs = `${command} --request-timeout ${getRequestTimeout()}`;
	kubectlShellResult = await kubectl.invokeCommand(commandWithArgs);


	if(printOutput) {
		output.send(`> kubectl ${command}`, {
			channelName: 'GitOps: kubectl',
			newline: 'single',
			revealOutputView: false,
		});

		if (kubectlShellResult?.code === 0) {
			output.send(kubectlShellResult.stdout, {
				channelName: 'GitOps: kubectl',
				revealOutputView: false,
			});
		} else {
			output.send(kubectlShellResult?.stderr || '', {
				channelName: 'GitOps: kubectl',
				revealOutputView: false,
				logLevel: 'error',
			});
		}
	}

	return kubectlShellResult;
}


function getRequestTimeout(): string {
	return workspace.getConfiguration('gitops').get('kubectlTimeout') || '20s';
}

