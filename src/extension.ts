import { commands, ExtensionContext, ExtensionMode, window, workspace } from 'vscode';

import { initFluxInformers } from 'data/fluxInformer';
import { checkFluxPrerequisites, checkWGEVersion } from './cli/checkVersions';
import { shell } from './cli/shell/exec';
import { registerCommands } from './commands/commands';
import { getExtensionVersion } from './commands/showInstalledVersions';
import { showNewUserGuide } from './commands/showNewUserGuide';
import { GlobalState, GlobalStateKey } from './data/globalState';
import { Telemetry } from './data/telemetry';
import { succeeded } from './types/errorable';
import { CommandId, ContextId, GitOpsExtensionConstants } from './types/extensionIds';
import { TelemetryEvent } from './types/telemetryEventNames';
import { promptToInstallFlux } from './ui/promptToInstallFlux';
import { statusBar } from './ui/statusBar';
import { clusterTreeViewProvider, createTreeViews, sourceTreeViewProvider, templateTreeViewProvider, workloadTreeViewProvider } from './ui/treeviews/treeViews';

/** Disable interactive modal dialogs, useful for testing */
export let disableConfirmations = false;
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

/**
 * Called when GitOps extension is activated.
 * @param context VSCode extension context.
 */
export async function activate(context: ExtensionContext) {
	// Keep a reference to the extension context
	extensionContext = context;
	listenConfigChanged();

	globalState = new GlobalState(context);

	telemetry = new Telemetry(context, getExtensionVersion(), GitOpsExtensionConstants.ExtensionId);

	// create gitops tree views
	createTreeViews();
	// await startFluxInformers(sourceTreeViewProvider, workloadTreeViewProvider, templateTreeViewProvider);
	await initFluxInformers();

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
		disableConfirmations = true;
	}


	const version = context.extension.packageJSON.version;
	if(context.extensionMode === ExtensionMode.Development || version.indexOf('-') !== -1) {
		experimentalFlag = true;
	}


	// show error notification if flux is not installed
	const fluxFoundResult = await promptToInstallFlux();
	if (succeeded(fluxFoundResult)) {
		// check flux prerequisites
		await checkFluxPrerequisites();
	}

	checkWGEVersion();

	let api = {
		shell: shell,
		data: {
			clusterTreeViewProvider: clusterTreeViewProvider,
			sourceTreeViewProvider: sourceTreeViewProvider,
			workloadTreeViewProvider: workloadTreeViewProvider,
		}};

	return api;
}

function listenConfigChanged() {
	workspace.onDidChangeConfiguration(async e => {
		if(!e.affectsConfiguration('gitops')) {
			return;
		}

		const selected = await window.showInformationMessage('Configuration changed. Reload VS Code to apply?', 'Reload');
		console.log(e);
		if(selected === 'Reload') {
			await commands.executeCommand(CommandId.VSCodeReload);
		}
	});
}

export function enabledWGE(): boolean {
	return workspace.getConfiguration('gitops').get('weaveGitopsEnterprise') || false;
}


/**
 * Called when extension is deactivated.
 */
export function deactivate() {
	telemetry?.dispose();
	statusBar?.dispose();
}



export async function setVSCodeContext(context: ContextId, value: boolean) {
	return await commands.executeCommand(CommandId.VSCodeSetContext, context, value);
}

