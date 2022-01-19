import { ExtensionContext, ExtensionMode } from 'vscode';
import { registerCommands } from './commands';
import { getExtensionVersion } from './commands/showInstalledVersions';
import { ContextTypes, setVSCodeContext } from './context';
import { succeeded } from './errorable';
import { setExtensionContext } from './extensionContext';
import { checkIfOpenedFolderGitRepositorySourceExists } from './git/checkIfOpenedFolderGitRepositorySourceExists';
import { GlobalState } from './globalState';
import { checkFluxPrerequisites, promptToInstallFlux } from './install';
import { statusBar } from './statusBar';
import { Telemetry, TelemetryEventNames } from './telemetry';
import { createTreeViews } from './views/treeViews';

export const enum GitOpsExtensionConstants {
	ExtensionId = 'weaveworks.vscode-gitops-tools',
	FirstEverActivationStorageKey = 'firstEverActivation',
	FluxPath = 'fluxPath',
}

/** State that is saved even between editor reloads */
export let globalState: GlobalState;
/** Methods to report telemetry over Application Insights (Exceptions or Custom Events). */
export let telemetry: Telemetry;

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

	telemetry.send(TelemetryEventNames.Startup);

	if (context.globalState.get(GitOpsExtensionConstants.FirstEverActivationStorageKey) === undefined) {
		telemetry.send(TelemetryEventNames.NewInstall);
		context.globalState.update(GitOpsExtensionConstants.FirstEverActivationStorageKey, false);
	}

	// set vscode context: developing extension
	setVSCodeContext(ContextTypes.IsDev, context.extensionMode === ExtensionMode.Development);

	// show error notification if flux is not installed
	const fluxFoundResult = await promptToInstallFlux();
	if (succeeded(fluxFoundResult)) {
		// check flux prerequisites
		await checkFluxPrerequisites();
	}
}

/**
 * Called when extension is deactivated.
 */
export function deactivate() {
	telemetry?.dispose();
	statusBar?.dispose();
}
