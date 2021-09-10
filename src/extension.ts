import {
	commands, ExtensionContext
} from 'vscode';
import { FluxCommands, KubectlCommands, registerCommands } from './commands';
import { createAllTreeViews } from './views/treeViews';

/**
 * Activates GitOps extension.
 * @param context VSCode extension context.
 */
export function activate(context: ExtensionContext) {
	// create gitops tree views
	createAllTreeViews(context);

	// register gitops commands
	registerCommands(context);

	// show kubectl version in gitops terminal
	commands.executeCommand(KubectlCommands.Version);

	// run Flux prerequisites check
	commands.executeCommand(FluxCommands.CheckPrerequisites);
}

export function deactivate() {}
