import { ExtensionContext, extensions } from 'vscode';
import TelemetryReporter from 'vscode-extension-telemetry';
import { registerCommands } from './commands';
import { setExtensionContext } from './extensionContext';
import { checkIfOpenedFolderGitRepositorySourceExists } from './git/checkIfOpenedFolderGitRepositorySourceExists';
import { checkPrerequisites, promptToInstallFlux } from './install';
import { statusBar } from './statusBar';
import { createTreeViews } from './views/treeViews';

// TODO: implement
// const extensionId = 'weaveworks.vscode-gitops-tools';
// const extensionVersion = extensions.getExtension(extensionId)?.packageJSON.version || 'unknown version';
// const key = 'da19a1446ba2-369b-0484-b857-e706cf38'.split('').reverse().join('');

// let reporter;

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


	// reporter = new TelemetryReporter(extensionId, extensionVersion, key);
	// reporter.sendTelemetryEvent('Something info',	{'stringProp': 'some string' }, { 'numericMeasure': 123 });
	// context.subscriptions.push(reporter);

	// show error notification if flux is not installed
	await promptToInstallFlux();

	// run Flux prerequisites check
	await checkPrerequisites();
}

export function deactivate() {}
