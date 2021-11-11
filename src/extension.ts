import { ExtensionContext } from 'vscode';
import { registerCommands } from './commands';
import { setExtensionContext } from './extensionContext';
import { checkIfOpenedFolderGitRepositorySourceExists } from './git/checkIfOpenedFolderGitRepositorySourceExists';
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

	// Change menu item in File Explorer (Add Git Repository / Reconcile Repository)
	// depending if the current opened folder is a git repository and already added
	// to the cluster
	checkIfOpenedFolderGitRepositorySourceExists();

	// show error notification if flux is not installed
	await promptToInstallFlux();

	// run Flux prerequisites check
	await checkPrerequisites();
}

export function deactivate() {}
