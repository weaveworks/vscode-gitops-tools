import { commands, ExtensionContext, ExtensionMode, window, workspace } from 'vscode';
import { CommandId, registerCommands } from './commands';
import { getExtensionVersion } from './commands/showInstalledVersions';
import { showNewUserGuide } from './commands/showNewUserGuide';
import { ContextTypes, setVSCodeContext } from './vscodeContext';
import { succeeded } from './errorable';
import { setExtensionContext } from './extensionContext';
import { GlobalState, GlobalStateKey } from './globalState';
import { checkFluxPrerequisites, checkWGEVersion, promptToInstallFlux } from './install';
import { statusBar } from './statusBar';
import { Telemetry, TelemetryEventNames } from './telemetry';
import { createTreeViews, clusterTreeViewProvider, sourceTreeViewProvider, workloadTreeViewProvider } from './views/treeViews';
import { shell } from './shell';

/** Disable interactive modal dialogs, useful for testing */
export let disableConfirmations = false;
export let experimentalFlag = false;


export const enum GitOpsExtensionConstants {
	ExtensionId = 'weaveworks.vscode-gitops-tools',
}

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
	setExtensionContext(context);
	listenConfigChanged();

	globalState = new GlobalState(context);

	telemetry = new Telemetry(context, getExtensionVersion(), GitOpsExtensionConstants.ExtensionId);

	// create gitops tree views
	createTreeViews();

	// register gitops commands
	registerCommands(context);

	telemetry.send(TelemetryEventNames.Startup);

	if (globalState.get(GlobalStateKey.FirstEverActivationStorageKey) === undefined) {
		telemetry.send(TelemetryEventNames.NewInstall);
		showNewUserGuide();
		globalState.set(GlobalStateKey.FirstEverActivationStorageKey, false);
	}

	// set vscode context: developing extension. test is also dev
	setVSCodeContext(ContextTypes.IsDev, context.extensionMode === ExtensionMode.Development || context.extensionMode === ExtensionMode.Test );
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
