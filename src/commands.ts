import { commands, Disposable, ExtensionContext } from 'vscode';
import { fluxDisableGitOps, fluxEnableGitOps } from './commands/fluxEnableGitOps';
import { fluxCheck } from './commands/fluxCheck';
import { checkFluxPrerequisites } from './commands/fluxCheckPrerequisites';
import { fluxReconcileApplication } from './commands/fluxReconcileApplication';
import { fluxReconcileSource } from './commands/fluxReconcileSource';
import { openResource } from './commands/openResource';
import { pullGitRepository } from './commands/pullGitRepository';
import { setCurrentKubernetesContext } from './commands/setCurrentKubernetesContext';
import { showKubectlVersion } from './commands/showKubectlVersion';
import { showLogs } from './commands/showLogs';
import { showOutputChannel } from './output';
import { refreshApplicationTreeView, refreshSourceTreeView, refreshTreeViews } from './views/treeViews';
import { addGitRepository } from './commands/addGitRepository';

/**
 * Command ids registered by this extension
 * or default vscode commands.
 */
export const enum CommandId {

	// vscode commands
	/**
	 * Opens the provided resource in the editor. Can be a text or binary file, or an http(s) URL.
	 */
	VSCodeOpen = 'vscode.open',
	/**
	 * Set vscode context to use in keybindings/menus/welcome views
	 * @see https://code.visualstudio.com/api/references/when-clause-contexts
	 */
	VSCodeSetContext = 'setContext',

	// kubectl
	KubectlVersion = 'gitops.kubectl.version',
	SetCurrentKubernetesContext = 'gitops.kubectl.setCurrentContext',

	// flux
	FluxCheck = 'gitops.flux.check',
	FluxCheckPrerequisites = 'gitops.flux.checkPrerequisites',
	FluxEnableGitOps = 'gitops.flux.install',
	FluxDisableGitOps = 'gitops.flux.uninstall',
	FluxReconcileSource = 'gitops.flux.reconcileSource',
	FluxReconcileApplication = 'gitops.flux.reconcileApplication',

	// tree view
	RefreshTreeViews = 'gitops.views.refreshTreeViews',
	RefreshSourcesTreeView = 'gitops.views.refreshSourceTreeView',
	RefreshApplicationsTreeView = 'gitops.views.refreshApplicationTreeView',
	PullGitRepository = 'gitops.views.pullGitRepository',
	AddGitRepository = 'gitops.views.addGitRepository',

	// editor
	EditorOpenResource = 'gitops.editor.openResource',

	// webview
	ShowLogs = 'gitops.editor.showLogs',

	// output commands
	ShowOutputChannel = 'gitops.output.show',
}

let _context: ExtensionContext;

/**
 * Registers GitOps extension commands.
 * @param context VSCode extension context.
 */
export function registerCommands(context: ExtensionContext) {
	_context = context;

	// kubectl
	registerCommand(CommandId.KubectlVersion, showKubectlVersion);
	registerCommand(CommandId.SetCurrentKubernetesContext, setCurrentKubernetesContext);

	// flux
	registerCommand(CommandId.FluxCheck, fluxCheck);
	registerCommand(CommandId.FluxCheckPrerequisites, checkFluxPrerequisites);
	registerCommand(CommandId.FluxReconcileSource, fluxReconcileSource);
	registerCommand(CommandId.FluxReconcileApplication, fluxReconcileApplication);
	registerCommand(CommandId.FluxEnableGitOps, fluxEnableGitOps);
	registerCommand(CommandId.FluxDisableGitOps, fluxDisableGitOps);

	// tree views
	registerCommand(CommandId.RefreshTreeViews, refreshTreeViews);
	registerCommand(CommandId.RefreshSourcesTreeView, refreshSourceTreeView);
	registerCommand(CommandId.RefreshApplicationsTreeView, refreshApplicationTreeView);
	registerCommand(CommandId.PullGitRepository, pullGitRepository);
	registerCommand(CommandId.AddGitRepository, addGitRepository);

	// editor
	registerCommand(CommandId.EditorOpenResource, openResource);

	// webview
	registerCommand(CommandId.ShowLogs, showLogs);

	// output
	registerCommand(CommandId.ShowOutputChannel, showOutputChannel);
}

/**
 * Registers vscode extension command.
 * @param commandId Command identifier.
 * @param callback Command handler.
 * @param thisArg The `this` context used when invoking the handler function.
 */
function registerCommand(commandId: string, callback: (...args: any[])=> any, thisArg?: any): void {

	const command: Disposable = commands.registerCommand(commandId, (...args) => {

		// Show error in console when it happens in any of the commands registered by this extension.
		// By default VSCode only shows that "Error running command <command>" but not its text.
		try {
			callback(...args);
		} catch(e) {
			console.error(e);
		}
	}, thisArg);

	// When this extension is deactivated the disposables will be disposed.
	_context.subscriptions.push(command);
}

