import safesh from 'shell-escape-tag';
import { window } from 'vscode';

import * as k8s from '@kubernetes/client-node';
import { ActionOnInvalid } from '@kubernetes/client-node/dist/config_types';
import { shellCodeError } from 'cli/shell/exec';
import { refreshAllTreeViews } from 'commands/refreshTreeViews';
import { setVSCodeContext, telemetry } from 'extension';
import { ContextId } from 'types/extensionIds';
import { TelemetryError } from 'types/telemetryEventNames';
import { refreshClustersTreeView } from 'ui/treeviews/treeViews';
import { kcContextsListChanged, kcCurrentContextChanged, kcTextChanged } from 'utils/kubeConfigCompare';
import { loadAvailableResourceKinds } from './apiResources';
import { restartKubeProxy } from './kubectlProxy';
import { loadKubeConfigPath } from './kubernetesConfigWatcher';
import { invokeKubectlCommand } from './kubernetesToolsKubectl';


export const kubeConfig: k8s.KubeConfig  = new k8s.KubeConfig();

// reload the kubeconfig via kubernetes-tools. fire events if things have changed
export async function loadKubeConfig(forceReloadResourceKinds = false) {
	console.log('loadKubeConfig');

	const configShellResult = await invokeKubectlCommand('config view');

	if (configShellResult?.code !== 0) {
		telemetry.sendError(TelemetryError.FAILED_TO_GET_KUBECTL_CONFIG);
		const path = await loadKubeConfigPath();
		window.showErrorMessage(`Failed to load kubeconfig: ${path} ${shellCodeError(configShellResult)}`);
		return;
	}

	const newKubeConfig = new k8s.KubeConfig();
	newKubeConfig.loadFromString(configShellResult.stdout, {onInvalidEntry: ActionOnInvalid.FILTER});

	if (kcTextChanged(kubeConfig, newKubeConfig)) {
		const contextsListChanged = kcContextsListChanged(kubeConfig, newKubeConfig);
		const contextChanged = kcCurrentContextChanged(kubeConfig, newKubeConfig);

		// load the changed kubeconfig globally so that subsequent commands use the new config
		kubeConfig.loadFromString(configShellResult.stdout);

		if(contextsListChanged) {
			refreshClustersTreeView();
		}

		if(contextChanged || forceReloadResourceKinds) {
			await loadAvailableResourceKinds();
		}

		if(contextChanged) {
			console.log('currentContext changed', kubeConfig.getCurrentContext());
			vscodeOnCurrentContextChanged();
			await restartKubeProxy();
			// give proxy a chance to start
			setTimeout(() => {
				refreshAllTreeViews();
			}, 100);
		}
	} else if(forceReloadResourceKinds) {
		await loadAvailableResourceKinds();
	}
}

async function vscodeOnCurrentContextChanged() {
	setVSCodeContext(ContextId.NoClusterSelected, false);
	setVSCodeContext(ContextId.CurrentClusterGitOpsNotEnabled, false);
	setVSCodeContext(ContextId.NoSources, false);
	setVSCodeContext(ContextId.NoWorkloads, false);
	setVSCodeContext(ContextId.FailedToLoadClusterContexts, false);
}

/**
 * Sets current kubectl context.
 * @param contextName Kubectl context name to use.
 * @returns `undefined` in case of an error or Object with information about
 * whether or not context was switched or didn't need it (current).
 */
export async function setCurrentContext(contextName: string): Promise<undefined | { isChanged: boolean;	}> {
	if (kubeConfig.getCurrentContext() === contextName) {
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

	return {
		isChanged: true,
	};
}

