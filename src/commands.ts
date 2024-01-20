import { commands, Disposable, ExtensionContext, Uri, window } from 'vscode';
import { copyResourceName } from './commands/copyResourceName';
import { createGitRepositoryForPath } from './commands/createGitRepositoryForPath';
import { createKustomizationForPath } from './commands/createKustomizationForPath';
import { addSource } from './commands/addSource';
import { addKustomization } from './commands/addKustomization';
import { deleteWorkload } from './commands/deleteWorkload';
import { deleteSource } from './commands/deleteSource';
import { fluxDisableGitOps, fluxEnableGitOps } from './commands/enableDisableGitOps';
import { fluxCheck } from './commands/fluxCheck';
import { checkFluxPrerequisites } from './commands/fluxCheckPrerequisites';
import { fluxReconcileRepositoryForPath } from './commands/fluxReconcileGitRepositoryForPath';
import { fluxReconcileSourceCommand } from './commands/fluxReconcileSource';
import { fluxReconcileWorkload } from './commands/fluxReconcileWorkload';
import { installFluxCli } from './commands/installFluxCli';
import { openResource } from './commands/openResource';
import { pullGitRepository } from './commands/pullGitRepository';
import { resume } from './commands/resume';
import { setClusterProvider } from './commands/setClusterProvider';
import { setCurrentKubernetesContext } from './commands/setCurrentKubernetesContext';
import { showGlobalState } from './commands/showGlobalState';
import { showInstalledVersions } from './commands/showInstalledVersions';
import { showNewUserGuide } from './commands/showNewUserGuide';
import { showLogs } from './commands/showLogs';
import { showWorkloadsHelpMessage } from './commands/showWorkloadsHelpMessage';
import { suspend } from './commands/suspend';
import { trace } from './commands/trace';
import { telemetry } from './extension';
import { showOutputChannel } from './output';
import { TelemetryErrorEventNames } from './telemetry';
import { refreshAllTreeViews, refreshResourcesTreeViews } from './views/treeViews';
import { createFromTemplate } from './commands/createFromTemplate';

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
	VSCodeReload = 'workbench.action.reloadWindow',
	/**
	 * Set vscode context to use in keybindings/menus/welcome views
	 * @see https://code.visualstudio.com/api/references/when-clause-contexts
	 */
	VSCodeSetContext = 'setContext',

	// kubectl
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
	RefreshResourcesTreeView = 'gitops.views.refreshResourcesTreeView',
	PullGitRepository = 'gitops.views.pullGitRepository',
	CreateGitRepository = 'gitops.views.createGitRepository',
	CreateKustomization = 'gitops.createKustomization',
	ShowWorkloadsHelpMessage = 'gitops.views.showWorkloadsHelpMessage',
	DeleteWorkload = 'gitops.views.deleteWorkload',
	DeleteSource = 'gitops.views.deleteSource',
	CopyResourceName = 'gitops.copyResourceName',
	AddSource = 'gitops.addSource',
	AddKustomization = 'gitops.addKustomization',

	// editor
	EditorOpenResource = 'gitops.editor.openResource',

	// webview
	ShowLogs = 'gitops.editor.showLogs',
	ShowNewUserGuide = 'gitops.views.showNewUserGuide',

	// output commands
	ShowOutputChannel = 'gitops.output.show',

	// others
	ShowInstalledVersions = 'gitops.showInstalledVersions',
	InstallFluxCli = 'gitops.installFluxCli',
	ShowGlobalState = 'gitops.dev.showGlobalState',
	CreateFromTemplate = 'gitops.views.createFromTemplate',
}

let _context: ExtensionContext;

/**
 * Registers GitOps extension commands.
 * @param context VSCode extension context.
 */
export function registerCommands(context: ExtensionContext) {
	_context = context;

	// kubectl
	registerCommand(CommandId.SetCurrentKubernetesContext, setCurrentKubernetesContext);

	// flux
	registerCommand(CommandId.Suspend, suspend);
	registerCommand(CommandId.Resume, resume);
	registerCommand(CommandId.CreateKustomization, createKustomizationForPath);
	registerCommand(CommandId.FluxCheck, fluxCheck);
	registerCommand(CommandId.FluxCheckPrerequisites, checkFluxPrerequisites);
	registerCommand(CommandId.FluxReconcileSource, fluxReconcileSourceCommand);
	registerCommand(CommandId.FluxReconcileRepository, fluxReconcileRepositoryForPath);
	registerCommand(CommandId.FluxReconcileWorkload, fluxReconcileWorkload);
	registerCommand(CommandId.FluxEnableGitOps, fluxEnableGitOps);
	registerCommand(CommandId.FluxDisableGitOps, fluxDisableGitOps);
	registerCommand(CommandId.FluxTrace, trace);

	// tree views
	registerCommand(CommandId.SetClusterProvider, setClusterProvider);
	registerCommand(CommandId.RefreshAllTreeViews, refreshAllTreeViews);
	registerCommand(CommandId.RefreshResourcesTreeView, refreshResourcesTreeViews);
	registerCommand(CommandId.PullGitRepository, pullGitRepository);
	registerCommand(CommandId.CreateGitRepository, (fileExplorerUri?: Uri) => {
		// only pass one argument when running from File Explorer context menu
		createGitRepositoryForPath(fileExplorerUri);
	});
	registerCommand(CommandId.ShowWorkloadsHelpMessage, showWorkloadsHelpMessage);
	registerCommand(CommandId.DeleteWorkload, deleteWorkload);
	registerCommand(CommandId.DeleteSource, deleteSource);
	registerCommand(CommandId.CopyResourceName, copyResourceName);
	registerCommand(CommandId.AddSource, addSource);
	registerCommand(CommandId.AddKustomization, addKustomization);


	// editor
	registerCommand(CommandId.EditorOpenResource, openResource);

	// webview
	registerCommand(CommandId.ShowLogs, showLogs);
	registerCommand(CommandId.ShowNewUserGuide, showNewUserGuide);

	// output
	registerCommand(CommandId.ShowOutputChannel, showOutputChannel);

	// others
	registerCommand(CommandId.ShowInstalledVersions, showInstalledVersions);
	registerCommand(CommandId.InstallFluxCli, installFluxCli);
	registerCommand(CommandId.ShowGlobalState, showGlobalState);
	registerCommand(CommandId.CreateFromTemplate, createFromTemplate);
}

/**
 * Registers vscode extension command.
 * @param commandId Command identifier.
 * @param callback Command handler.
 * @param thisArg The `this` context used when invoking the handler function.
 */
function registerCommand(commandId: string, callback: (...args: any[])=> any, thisArg?: any): void {

	const command: Disposable = commands.registerCommand(commandId, async(...args) => {

		// Show error in console when it happens in any of the commands registered by this extension.
		// By default VSCode only shows that "Error running command <command>" but not its text.
		try {
			await callback(...args);
		} catch(e: unknown) {
			telemetry.sendError(TelemetryErrorEventNames.UNCAUGHT_EXCEPTION, e as Error);
			window.showErrorMessage(String(e));
			console.error(e);
		}
	}, thisArg);

	// When this extension is deactivated the disposables will be disposed.
	_context.subscriptions.push(command);
}

