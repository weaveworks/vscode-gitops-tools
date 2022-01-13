import { ExtensionContext } from 'vscode';
import { registerCommands } from './commands';
import { setExtensionContext } from './extensionContext';
import { checkIfOpenedFolderGitRepositorySourceExists } from './git/checkIfOpenedFolderGitRepositorySourceExists';
import { checkPrerequisites, promptToInstallFlux } from './install';
import { statusBar } from './statusBar';
import { telemetry, TelemetryEventNames } from './telemetry';
import { createTreeViews } from './views/treeViews';

export const enum GitOpsExtensionConstants {
	ExtensionId = 'weaveworks.vscode-gitops-tools',
	FirstEverActivationStorageKey = 'firstEverActivation',
	FluxPath = 'fluxPath',
}

/**
 * Called when GitOps extension is activated.
 * @param context VSCode extension context.
 */
export async function activate(context: ExtensionContext) {

	// Keep a reference to the extension context
	setExtensionContext(context);

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

	// show error notification if flux is not installed
	await promptToInstallFlux();

	// run Flux prerequisites check
	// TODO: only run when flux is installed
	await checkPrerequisites();
}

/**
 * Called when extension is deactivated.
 */
export function deactivate() {
	telemetry.dispose();
	statusBar.dispose();
}
