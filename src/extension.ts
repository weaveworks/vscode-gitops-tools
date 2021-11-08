import { ExtensionContext } from 'vscode';
import { registerCommands } from './commands';
import { setExtensionContext } from './extensionContext';
import { checkPrerequisites, promptToInstallFlux } from './install';
import { statusBar } from './statusBar';
import { createTreeViews } from './views/treeViews';

/**
 * Activates GitOps extension.
 * @param context VSCode extension context.
 */
export async function activate(context: ExtensionContext) {

	// Keep a reference to the extension context
	setExtensionContext(context);

	// initialize gitops status bar
	context.subscriptions.push(statusBar.statusBarItem);

	// create gitops tree views
	createTreeViews();

	// register gitops commands
	registerCommands(context);

	// show error notification if flux is not installed
	await promptToInstallFlux();

	// run Flux prerequisites check
	await checkPrerequisites();
}

export function deactivate() {}
