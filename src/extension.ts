import {
	commands,
	ExtensionContext
} from 'vscode';
import { createTreeViews } from './views/treeViews';
import {
	FluxCommands,
	registerCommands
} from './commands';
import { statusBar } from './statusBar';
import { promptToInstallFlux } from './install';

/**
 * Activates GitOps extension.
 * @param context VSCode extension context.
 */
export function activate(context: ExtensionContext) {

	// initialize gitops status bar
	context.subscriptions.push(statusBar.status);
	statusBar.show('Initializing GitOps');// TODO: should be inside the Cluster tree view, status bar is being stuck forever when Clusters view is not visible

	// create gitops tree views
	createTreeViews(context);

	// register gitops commands
	registerCommands(context);

	// show error notification if flux is not installed
	promptToInstallFlux();

	// run Flux prerequisites check
	commands.executeCommand(FluxCommands.CheckPrerequisites);
}

export function deactivate() {}
