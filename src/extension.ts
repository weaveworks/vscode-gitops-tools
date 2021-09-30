import { ExtensionContext } from 'vscode';
import { createTreeViews } from './views/treeViews';
import { registerCommands } from './commands';
import { statusBar } from './statusBar';
import { checkPrerequisites, promptToInstallFlux } from './install';

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
	checkPrerequisites();
}

export function deactivate() {}
