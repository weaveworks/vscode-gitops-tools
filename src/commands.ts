import { commands, Disposable, ExtensionContext } from 'vscode';
import { addGitRepository } from './commands/addGitRepository';
import { deleteSource } from './commands/deleteSource';
import { fluxCheck } from './commands/fluxCheck';
import { checkFluxPrerequisites } from './commands/fluxCheckPrerequisites';
import { fluxDisableGitOps, fluxEnableGitOps } from './commands/fluxEnableGitOps';
import { fluxReconcileApplication } from './commands/fluxReconcileApplication';
import { fluxReconcileRepository } from './commands/fluxReconcileRepository';
import { fluxReconcileSourceCommand } from './commands/fluxReconcileSource';
import { openResource } from './commands/openResource';
import { pullGitRepository } from './commands/pullGitRepository';
import { resumeSource } from './commands/resume';
import { setCurrentKubernetesContext } from './commands/setCurrentKubernetesContext';
import { showKubectlVersion } from './commands/showKubectlVersion';
import { showLogs } from './commands/showLogs';
import { suspendSource } from './commands/suspend';
import { showOutputChannel } from './output';
import { refreshApplicationTreeView, refreshSourceTreeView, refreshAllTreeViews } from './views/treeViews';

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
	SuspendSource = 'gitops.suspendSource',
	ResumeSource = 'gitops.resumeSource',
	FluxCheck = 'gitops.flux.check',
	FluxCheckPrerequisites = 'gitops.flux.checkPrerequisites',
	FluxEnableGitOps = 'gitops.flux.install',
	FluxDisableGitOps = 'gitops.flux.uninstall',
	FluxReconcileSource = 'gitops.flux.reconcileSource',
	FluxReconcileRepository = 'gitops.flux.reconcileRepository',
	FluxReconcileApplication = 'gitops.flux.reconcileApplication',

	// tree view
	RefreshAllTreeViews = 'gitops.views.refreshAllTreeViews',
	RefreshSourcesTreeView = 'gitops.views.refreshSourceTreeView',
	RefreshApplicationsTreeView = 'gitops.views.refreshApplicationTreeView',
	PullGitRepository = 'gitops.views.pullGitRepository',
	AddGitRepository = 'gitops.views.addGitRepository',
	DeleteSource = 'gitops.views.deleteSource',

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
	registerCommand(CommandId.SuspendSource, suspendSource);
	registerCommand(CommandId.ResumeSource, resumeSource);
	registerCommand(CommandId.FluxCheck, fluxCheck);
	registerCommand(CommandId.FluxCheckPrerequisites, checkFluxPrerequisites);
	registerCommand(CommandId.FluxReconcileSource, fluxReconcileSourceCommand);
	registerCommand(CommandId.FluxReconcileRepository, fluxReconcileRepository);
	registerCommand(CommandId.FluxReconcileApplication, fluxReconcileApplication);
	registerCommand(CommandId.FluxEnableGitOps, fluxEnableGitOps);
	registerCommand(CommandId.FluxDisableGitOps, fluxDisableGitOps);

	// tree views
	registerCommand(CommandId.RefreshAllTreeViews, refreshAllTreeViews);
	registerCommand(CommandId.RefreshSourcesTreeView, refreshSourceTreeView);
	registerCommand(CommandId.RefreshApplicationsTreeView, refreshApplicationTreeView);
	registerCommand(CommandId.PullGitRepository, pullGitRepository);
	registerCommand(CommandId.AddGitRepository, addGitRepository);
	registerCommand(CommandId.DeleteSource, deleteSource);

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

