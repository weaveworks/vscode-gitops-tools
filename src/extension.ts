import { CodeAction, ExtensionContext, ExtensionMode } from 'vscode';
import { registerCommands } from './commands';
import { getExtensionVersion } from './commands/showInstalledVersions';
import { showNewUserGuide } from './commands/showNewUserGuide';
import { ContextTypes, setVSCodeContext } from './vscodeContext';
import { succeeded } from './errorable';
import { setExtensionContext } from './extensionContext';
import { checkIfOpenedFolderGitRepositorySourceExists } from './git/checkIfOpenedFolderGitRepositorySourceExists';
import { GlobalState, GlobalStateKey } from './globalState';
import { checkFluxPrerequisites, promptToInstallFlux } from './install';
import { statusBar } from './statusBar';
import { Telemetry, TelemetryEventNames } from './telemetry';
import { createTreeViews, clusterTreeViewProvider, sourceTreeViewProvider, workloadTreeViewProvider } from './views/treeViews';
import { shell } from './shell';
import { openConfigureGitOpsPanel } from './panels/configureGitOps';

/** Disable interactive modal dialogs, useful for testing */
export let disableConfirmations = false;


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

	globalState = new GlobalState(context);

	telemetry = new Telemetry(context, getExtensionVersion(), GitOpsExtensionConstants.ExtensionId);

	// create gitops tree views
	createTreeViews();

	// register gitops commands
	registerCommands(context);

	// Change menu item in File Explorer (Add Git Repository / Reconcile Repository)
	// depending if the current opened folder is a git repository and already added
	// to the cluster
	checkIfOpenedFolderGitRepositorySourceExists();

	// openConfigureGitOpsPanel(true);

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

	// show error notification if flux is not installed
	const fluxFoundResult = await promptToInstallFlux();
	if (succeeded(fluxFoundResult)) {
		// check flux prerequisites
		await checkFluxPrerequisites();
	}

	let api = {
		shell: shell,
		data: {
			clusterTreeViewProvider: clusterTreeViewProvider,
			sourceTreeViewProvider: sourceTreeViewProvider,
			workloadTreeViewProvider: workloadTreeViewProvider,
		}};

	return api;
}

/**
 * Called when extension is deactivated.
 */
export function deactivate() {
	telemetry?.dispose();
	statusBar?.dispose();
}
