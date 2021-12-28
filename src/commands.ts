import { commands, Disposable, ExtensionContext } from 'vscode';
import { copyResourceName } from './commands/copyResourceName';
import { createGitRepository } from './commands/createGitRepository';
import { createKustomization } from './commands/createKustomization';
import { createSource } from './commands/createSource';
import { deleteSource } from './commands/deleteSource';
import { fluxDisableGitOps, fluxEnableGitOps } from './commands/enableDisableGitOps';
import { fluxCheck } from './commands/fluxCheck';
import { checkFluxPrerequisites } from './commands/fluxCheckPrerequisites';
import { fluxReconcileRepository } from './commands/fluxReconcileRepository';
import { fluxReconcileSourceCommand } from './commands/fluxReconcileSource';
import { fluxReconcileWorkload } from './commands/fluxReconcileWorkload';
import { openResource } from './commands/openResource';
import { pullGitRepository } from './commands/pullGitRepository';
import { resume } from './commands/resume';
import { setClusterProvider } from './commands/setClusterProvider';
import { setCurrentKubernetesContext } from './commands/setCurrentKubernetesContext';
import { showKubectlVersion } from './commands/showKubectlVersion';
import { showLogs } from './commands/showLogs';
import { showWorkloadsHelpMessage } from './commands/showWorkloadsHelpMessage';
import { suspend } from './commands/suspend';
import { trace } from './commands/trace';
import { showOutputChannel } from './output';
import { refreshAllTreeViews, refreshSourcesTreeView, refreshWorkloadsTreeView } from './views/treeViews';

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
	Suspend = 'gitops.suspend',
	Resume = 'gitops.resume',
	FluxCheck = 'gitops.flux.check',
	FluxCheckPrerequisites = 'gitops.flux.checkPrerequisites',
	FluxEnableGitOps = 'gitops.flux.install',
	FluxDisableGitOps = 'gitops.flux.uninstall',
	FluxReconcileSource = 'gitops.flux.reconcileSource',
	FluxReconcileRepository = 'gitops.flux.reconcileRepository',
	FluxReconcileWorkload = 'gitops.flux.reconcileWorkload',
	FluxTrace = 'gitops.flux.trace',

	// tree view
	SetClusterProvider = 'gitops.setClusterProvider',
	RefreshAllTreeViews = 'gitops.views.refreshAllTreeViews',
	RefreshSourcesTreeView = 'gitops.views.refreshSourceTreeView',
	RefreshWorkloadsTreeView = 'gitops.views.refreshWorkloadTreeView',
	PullGitRepository = 'gitops.views.pullGitRepository',
	CreateGitRepository = 'gitops.views.createGitRepository',
	CreateKustomization = 'gitops.createKustomization',
	ShowWorkloadsHelpMessage = 'gitops.views.showWorkloadsHelpMessage',
	DeleteSource = 'gitops.views.deleteSource',
	CopyResourceName = 'gitops.copyResourceName',

	// editor
	EditorOpenResource = 'gitops.editor.openResource',

	// webview
	ShowLogs = 'gitops.editor.showLogs',
	CreateSource = 'gitops.editor.createSource',

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
	registerCommand(CommandId.Suspend, suspend);
	registerCommand(CommandId.Resume, resume);
	registerCommand(CommandId.CreateKustomization, createKustomization);
	registerCommand(CommandId.FluxCheck, fluxCheck);
	registerCommand(CommandId.FluxCheckPrerequisites, checkFluxPrerequisites);
	registerCommand(CommandId.FluxReconcileSource, fluxReconcileSourceCommand);
	registerCommand(CommandId.FluxReconcileRepository, fluxReconcileRepository);
	registerCommand(CommandId.FluxReconcileWorkload, fluxReconcileWorkload);
	registerCommand(CommandId.FluxEnableGitOps, fluxEnableGitOps);
	registerCommand(CommandId.FluxDisableGitOps, fluxDisableGitOps);
	registerCommand(CommandId.FluxTrace, trace);

	// tree views
	registerCommand(CommandId.SetClusterProvider, setClusterProvider);
	registerCommand(CommandId.RefreshAllTreeViews, refreshAllTreeViews);
	registerCommand(CommandId.RefreshSourcesTreeView, refreshSourcesTreeView);
	registerCommand(CommandId.RefreshWorkloadsTreeView, refreshWorkloadsTreeView);
	registerCommand(CommandId.PullGitRepository, pullGitRepository);
	registerCommand(CommandId.CreateGitRepository, createGitRepository);
	registerCommand(CommandId.ShowWorkloadsHelpMessage, showWorkloadsHelpMessage);
	registerCommand(CommandId.DeleteSource, deleteSource);
	registerCommand(CommandId.CopyResourceName, copyResourceName);

	// editor
	registerCommand(CommandId.EditorOpenResource, openResource);

	// webview
	registerCommand(CommandId.ShowLogs, showLogs);
	registerCommand(CommandId.CreateSource, createSource);

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

