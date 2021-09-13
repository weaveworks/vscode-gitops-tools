import {
	commands,
	ExtensionContext
} from 'vscode';
import { createTreeViews } from './views/treeViews';
import {
	FluxCommands,
	KubectlCommands,
	registerCommands
} from './commands';
import { statusBar } from './statusBar';

/**
 * Activates GitOps extension.
 * @param context VSCode extension context.
 */
export function activate(context: ExtensionContext) {

	// initialize gitops status bar
	context.subscriptions.push(statusBar.status);
	statusBar.show('Initializing GitOps');

	// create gitops tree views
	createTreeViews(context);

	// register gitops commands
	registerCommands(context);

	// show kubectl version in gitops terminal
	commands.executeCommand(KubectlCommands.Version);

	// run Flux prerequisites check
	commands.executeCommand(FluxCommands.CheckPrerequisites);
}

export function deactivate() {}
