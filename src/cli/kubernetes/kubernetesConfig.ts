import safesh from 'shell-escape-tag';
import { window } from 'vscode';

import { shellCodeError } from 'cli/shell/exec';
import { setVSCodeContext, telemetry } from 'extension';
import { Errorable, aresult, failed, succeeded } from 'types/errorable';
import { ContextId } from 'types/extensionIds';
import { KubernetesConfig, KubernetesContextWithCluster } from 'types/kubernetes/kubernetesConfig';
import { TelemetryError } from 'types/telemetryEventNames';
import { parseJson } from 'utils/jsonUtils';
import { clearSupportedResourceKinds } from './kubectlGet';
import { invokeKubectlCommand } from './kubernetesToolsKubectl';

export let currentContextName: string;


/**
 * Gets current kubectl config with available contexts and clusters.
 */
export async function getKubectlConfig(): Promise<Errorable<KubernetesConfig>> {
	const configShellResult = await invokeKubectlCommand('config view -o json');

	if (configShellResult?.code !== 0) {
		telemetry.sendError(TelemetryError.FAILED_TO_GET_KUBECTL_CONFIG);
		return {
			succeeded: false,
			error: [shellCodeError(configShellResult)],
		};
	}

	const kubectlConfig = parseJson(configShellResult.stdout);
	return {
		succeeded: true,
		result: kubectlConfig,
	};
}

/**
 * Gets current kubectl context name.
 */
export async function getCurrentContextName(): Promise<Errorable<string>> {
	const currentContextShellResult = await invokeKubectlCommand('config current-context');
	if (currentContextShellResult?.code !== 0) {
		telemetry.sendError(TelemetryError.FAILED_TO_GET_CURRENT_KUBERNETES_CONTEXT);
		console.warn(`Failed to get current kubectl context: ${currentContextShellResult?.stderr}`);
		setVSCodeContext(ContextId.NoClusterSelected, true);
		return {
			succeeded: false,
			error: [`${currentContextShellResult?.code || ''} ${currentContextShellResult?.stderr}`],
		};
	}

	const currentContext = currentContextShellResult.stdout.trim();
	setVSCodeContext(ContextId.NoClusterSelected, false);

	currentContextName = currentContext;
	return {
		succeeded: true,
		result: currentContext,
	};
}

/**
 * Sets current kubectl context.
 * @param contextName Kubectl context name to use.
 * @returns `undefined` in case of an error or Object with information about
 * whether or not context was switched or didn't need it (current).
 */
export async function setCurrentContext(contextName: string): Promise<undefined | { isChanged: boolean;	}> {
	const currentContextResult = await getCurrentContextName();
	if (succeeded(currentContextResult) && currentContextResult.result === contextName) {
		return {
			isChanged: false,
		};
	}

	const setContextShellResult = await invokeKubectlCommand(safesh`config use-context ${contextName}`);
	if (setContextShellResult?.stderr) {
		telemetry.sendError(TelemetryError.FAILED_TO_SET_CURRENT_KUBERNETES_CONTEXT);
		window.showErrorMessage(`Failed to set kubectl context to ${contextName}: ${setContextShellResult?.stderr}`);
		return;
	}

	setVSCodeContext(ContextId.NoClusterSelected, false);
	setVSCodeContext(ContextId.CurrentClusterGitOpsNotEnabled, false);
	setVSCodeContext(ContextId.NoSources, false);
	setVSCodeContext(ContextId.NoWorkloads, false);
	setVSCodeContext(ContextId.FailedToLoadClusterContexts, false);
	clearSupportedResourceKinds();

	return {
		isChanged: true,
	};
}

/**
 * Get a list of contexts from kubeconfig.
 * Also add cluster info to the context objects.
 */
export async function getContexts(): Promise<Errorable<KubernetesContextWithCluster[]>> {
	const kubectlConfig = await getKubectlConfig();

	if (failed(kubectlConfig)) {
		return {
			succeeded: false,
			error: kubectlConfig.error,
		};
	}
	if (!kubectlConfig.result.contexts) {
		return {
			succeeded: false,
			error: ['Config fetched, but contexts not found.'],
		};
	}

	const contexts: KubernetesContextWithCluster[] = kubectlConfig.result.contexts.map((context: KubernetesContextWithCluster) => {
		const clusterInfo = kubectlConfig.result.clusters?.find(cluster => cluster.name === context.context.cluster);
		if (clusterInfo) {
			context.context.clusterInfo = clusterInfo;
		}
		return context;
	});

	return {
		succeeded: true,
		result: contexts,
	};
}

export async function getClusterName(contextName: string): Promise<string> {
	const contexts = await getContexts();
	if(contexts.succeeded === true) {
		return contexts.result.find(context => context.name === contextName)?.context.clusterInfo?.name || contextName;
	} else {
		return contextName;
	}
}

export async function getCurrentContextWithCluster(): Promise<KubernetesContextWithCluster | undefined> {
	const [contextName, contexts] = await Promise.all([
		aresult(getCurrentContextName()),
		aresult(getContexts()),
	]);

	if(!contextName || !contexts) {
		return;
	}

	// const contexts = result(contextsResults);
	const context = contexts?.find(c => c.name === contextName);

	return context;
}

