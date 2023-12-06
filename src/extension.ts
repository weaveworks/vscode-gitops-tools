import { commands, ExtensionContext, ExtensionMode, window, workspace } from 'vscode';

import { kubeProxyKeepAlive, stopKubeProxy } from 'cli/kubernetes/kubectlProxy';
import { syncKubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { initKubeConfigWatcher } from 'cli/kubernetes/kubernetesConfigWatcher';
import { checkWGEVersion } from './cli/checkVersions';
import * as shell from './cli/shell/exec';
import { registerCommands } from './commands/commands';
import { getExtensionVersion } from './commands/showInstalledVersions';
import { showNewUserGuide } from './commands/showNewUserGuide';
import { GlobalState, GlobalStateKey } from './data/globalState';
import { Telemetry } from './data/telemetry';
import { CommandId, ContextId, GitOpsExtensionConstants } from './types/extensionIds';
import { TelemetryEvent } from './types/telemetryEventNames';
import { checkInstalledFluxVersion } from './ui/promptToInstallFlux';
import { statusBar } from './ui/statusBar';
import { clusterDataProvider, createTreeViews, sourceDataProvider, workloadDataProvider } from './ui/treeviews/treeViews';

/** Disable interactive modal dialogs, useful for testing */
export let skipConfirmations = false;
export let experimentalFlag = false;

/*
 * This is the extension runtime context. contains workspace state, subscriptions, paths, persistent state, etc.
 Should not be confused with vscode context (like 'gitops:noClusterSelected' that's used in package.json to specify when to show/hide commands)
 */
export let extensionContext: ExtensionContext;

/** State that is saved even between editor reloads */
export let globalState: GlobalState;
/** Methods to report telemetry over Application Insights (Exceptions or Custom Events). */
export let telemetry: Telemetry | any;
export let isActive = true;

/**
 * Called when GitOps extension is activated.
 * @param context VSCode extension context.
 */
export async function activate(context: ExtensionContext) {
	// Keep a reference to the extension context
	extensionContext = context;
	listenExtensionConfigChanged();

	globalState = new GlobalState(context);

	telemetry = new Telemetry(context, getExtensionVersion(), GitOpsExtensionConstants.ExtensionId);

	initData();

	// register gitops commands
	registerCommands(context);

	telemetry.send(TelemetryEvent.Startup);

	if (globalState.get(GlobalStateKey.FirstEverActivationStorageKey) === undefined) {
		telemetry.send(TelemetryEvent.NewInstall);
		showNewUserGuide();
		globalState.set(GlobalStateKey.FirstEverActivationStorageKey, false);
	}

	// set vscode context: developing extension. test is also dev
	setVSCodeContext(ContextId.IsDev, context.extensionMode === ExtensionMode.Development || context.extensionMode === ExtensionMode.Test );
	if(context.extensionMode === ExtensionMode.Test) {
		skipConfirmations = true;
	}


	const version = context.extension.packageJSON.version;
	if(context.extensionMode === ExtensionMode.Development || version.indexOf('-') !== -1) {
		experimentalFlag = true;
	}


	// check version and show 'Install Flux?' dialog if flux is not installed
	checkInstalledFluxVersion();

	checkWGEVersion();

	let api = {
		shell: shell,
		data: {
			clusterTreeViewProvider: clusterDataProvider,
			sourceTreeViewProvider: sourceDataProvider,
			workloadTreeViewProvider: workloadDataProvider,
		}};

	return api;
}

async function initData() {
	syncKubeConfig(true);
	initKubeConfigWatcher();
	kubeProxyKeepAlive();

	// wait for kubectl proxy to start for faster initial tree view loading
	// setTimeout(() => {
	createTreeViews();
	// }, 200);
}

function listenExtensionConfigChanged() {
	workspace.onDidChangeConfiguration(async e => {
		if(!e.affectsConfiguration('gitops.weaveGitopsEnterprise')) {
			return;
		}

		const selected = await window.showInformationMessage('Configuration changed. Reload VS Code to apply?', 'Reload');
		if(selected === 'Reload') {
			await commands.executeCommand(CommandId.VSCodeReload);
		}
	});
}

export function enabledWGE(): boolean {
	return workspace.getConfiguration('gitops').get('weaveGitopsEnterprise') || false;
}

export function enabledFluxChecks(): boolean {
	return workspace.getConfiguration('gitops').get('doFluxCheck') || false;

}

export function suppressDebugMessages(): boolean {
	return workspace.getConfiguration('gitops').get('suppressDebugMessages') || false;
}


/**
 * Called when extension is deactivated.
 */
export function deactivate() {
	isActive = false;
	telemetry?.dispose();
	statusBar?.dispose();
	stopKubeProxy();
}



export async function setVSCodeContext(context: ContextId, value: boolean) {
	return await commands.executeCommand(CommandId.VSCodeSetContext, context, value);
}
