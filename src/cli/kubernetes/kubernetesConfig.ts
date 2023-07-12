import deepEqual from 'lite-deep-equal';
import safesh from 'shell-escape-tag';
import { EventEmitter, window } from 'vscode';

import * as k8s from '@kubernetes/client-node';
import { shellCodeError } from 'cli/shell/exec';
import { setVSCodeContext, telemetry } from 'extension';
import { Errorable, aresult, failed, result, succeeded } from 'types/errorable';
import { ContextId } from 'types/extensionIds';
import { KubernetesConfig, KubernetesContextWithCluster } from 'types/kubernetes/kubernetesConfig';
import { TelemetryError } from 'types/telemetryEventNames';
import { parseJson } from 'utils/jsonUtils';
import { clearSupportedResourceKinds } from './kubectlGet';
import { invokeKubectlCommand } from './kubernetesToolsKubectl';
import { ActionOnInvalid } from '@kubernetes/client-node/dist/config_types';

export const onKubeConfigChanged = new EventEmitter<k8s.KubeConfig>();
export const onCurrentContextChanged = new EventEmitter<k8s.KubeConfig>();

export const kubeConfig = new k8s.KubeConfig();

type KubeConfigChanges = {
	currentContextChanged: boolean;
	configChanged: boolean;
};

function compareKubeConfigs(kc1: k8s.KubeConfig, kc2: k8s.KubeConfig): KubeConfigChanges {
	// exportConfig() will omit tokens and certs
	const textChanged = kc1.exportConfig() !== kc2.exportConfig();

	const context1 = kc1.getContextObject(kc1.getCurrentContext());
	const context2 = kc2.getContextObject(kc2.getCurrentContext());

	const cluster1 = kc1.getCurrentCluster();
	const cluster2 = kc2.getCurrentCluster();

	const user1 = kc1.getCurrentUser();
	const user2 = kc2.getCurrentUser();

	const currentContextChanged = !deepEqual(context1, context2) || !deepEqual(cluster1, cluster2) || !deepEqual(user1, user2);

	return {
		currentContextChanged,
		configChanged: textChanged || currentContextChanged,
	};
}

// reload the kubeconfig via kubernetes-tools. fire events if things have changed
export async function loadKubeConfig(force = false) {
	const configShellResult = await invokeKubectlCommand('config view');

	if (configShellResult?.code !== 0) {
		telemetry.sendError(TelemetryError.FAILED_TO_GET_KUBECTL_CONFIG);
		return;
	}

	console.log('kc context name', kubeConfig.getCurrentContext());

	const newKubeConfig = new k8s.KubeConfig();
	newKubeConfig.loadFromString(configShellResult.stdout, {onInvalidEntry: ActionOnInvalid.FILTER});

	const kcChanges = compareKubeConfigs(kubeConfig, newKubeConfig);
	if (force || kcChanges.configChanged) {
		kubeConfig.loadFromString(configShellResult.stdout);

		console.log('KubeConfig changed');
		onKubeConfigChanged.fire(kubeConfig);

		if(force || kcChanges.currentContextChanged) {
			console.log('Current Context changed');
			onCurrentContextChanged.fire(kubeConfig);
		}
	}
}


/**
 * Sets current kubectl context.
 * @param contextName Kubectl context name to use.
 * @returns `undefined` in case of an error or Object with information about
 * whether or not context was switched or didn't need it (current).
 */
export async function setCurrentContext(contextName: string): Promise<undefined | { isChanged: boolean;	}> {
	const currentContextResult = getCurrentContextName();
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
	return {succeeded: false, error: ['Not implemented']};
	// const kubectlConfig = await getKubectlConfig();

	// if (failed(kubectlConfig)) {
	// 	return {
	// 		succeeded: false,
	// 		error: kubectlConfig.error,
	// 	};
	// }
	// if (!kubectlConfig.result.contexts) {
	// 	return {
	// 		succeeded: false,
	// 		error: ['Config fetched, but contexts not found.'],
	// 	};
	// }

	// const contexts: KubernetesContextWithCluster[] = kubectlConfig.result.contexts.map((context: KubernetesContextWithCluster) => {
	// 	const currentContextNameKc = kubectlConfig.result['current-context'];
	// 	context.isCurrentContext = context.name === currentContextNameKc;
	// 	const clusterInfo = kubectlConfig.result.clusters?.find(cluster => cluster.name === context.context.cluster);
	// 	if (clusterInfo) {
	// 		context.context.clusterInfo = clusterInfo;
	// 	}
	// 	return context;
	// });

	// kubectlConfig.result['current-context'];

	// return {
	// 	succeeded: true,
	// 	result: contexts,
	// };
}

export async function getClusterName(contextName: string): Promise<string> {
	const context = kubeConfig.getContextObject(contextName);
	return kubeConfig.getCluster(context?.cluster || contextName)?.name ?? contextName;
}

export async function updateCurrentContextWithCluster(): Promise<KubernetesContextWithCluster | undefined> {
	const [contextName, contexts] = await Promise.all([
		result(getCurrentContextName()),
		aresult(getContexts()),
	]);

	if(!contextName || !contexts) {
		return;
	}

	// const contexts = result(contextsResults);
	const context = contexts?.find(c => c.name === contextName);

	return context;
}


/**
 * Gets current kubectl context name.
 */
export function getCurrentContextName(): Errorable<string> {
	const name = kubeConfig.getCurrentContext();
	if (name) {
		return {
			succeeded: true,
			result: kubeConfig.getCurrentContext(),
		};
	} else {
		return {
			succeeded: false,
			error: ['No current context'],
		};
	}
}


// const currentContextShellResult = await invokeKubectlCommand('config current-context');
// if (currentContextShellResult?.code !== 0) {
// 	telemetry.sendError(TelemetryError.FAILED_TO_GET_CURRENT_KUBERNETES_CONTEXT);
// 	console.warn(`Failed to get current kubectl context: ${currentContextShellResult?.stderr}`);
// 	setVSCodeContext(ContextId.NoClusterSelected, true);
// 	return {
// 		succeeded: false,
// 		error: [`${currentContextShellResult?.code || ''} ${currentContextShellResult?.stderr}`],
// 	};
// }

// const currentContext = currentContextShellResult.stdout.trim();
// setVSCodeContext(ContextId.NoClusterSelected, false);

// currentContextName = currentContext;
// return {
// 	succeeded: true,
// 	result: currentContext,
// };
// }


