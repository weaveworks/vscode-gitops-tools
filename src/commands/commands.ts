import { commands, Disposable, ExtensionContext, Uri, window } from 'vscode';

import { showOutputChannel } from 'cli/shell/output';
import { telemetry } from 'extension';
import { CommandId } from 'types/extensionIds';
import { TelemetryError } from 'types/telemetryEventNames';
import { refreshAllTreeViewsCommand, refreshResourcesTreeViewsCommand } from 'commands/refreshTreeViews';
import { addKustomization } from './addKustomization';
import { addSource } from './addSource';
import { copyResourceName } from './copyResourceName';
import { createFromTemplate } from './createFromTemplate';
import { createGitRepositoryForPath } from './createGitRepositoryForPath';
import { createKustomizationForPath } from './createKustomizationForPath';
import { deleteSource } from './deleteSource';
import { deleteWorkload } from './deleteWorkload';
import { fluxDisableGitOps, fluxEnableGitOps } from './enableDisableGitOps';
import { fluxCheck } from './fluxCheck';
import { checkFluxPrerequisites } from './fluxCheckPrerequisites';
import { fluxReconcileRepositoryForPath } from './fluxReconcileGitRepositoryForPath';
import { fluxReconcileSourceCommand } from './fluxReconcileSource';
import { fluxReconcileWorkload, fluxReconcileWorkloadWithSource } from './fluxReconcileWorkload';
import { installFluxCli } from './installFluxCli';
import { openResource } from './openResource';
import { pullGitRepository } from './pullGitRepository';
import { resume } from './resume';
import { setClusterProvider } from './setClusterProvider';
import { setCurrentKubernetesContext } from './setCurrentKubernetesContext';
import { showGlobalState } from './showGlobalState';
import { showInstalledVersions } from './showInstalledVersions';
import { showLogs } from './showLogs';
import { showNewUserGuide } from './showNewUserGuide';
import { showWorkloadsHelpMessage } from './showWorkloadsHelpMessage';
import { suspend } from './suspend';
import { trace } from './trace';


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
	registerCommand(CommandId.FluxReconcileWorkloadWithSource, fluxReconcileWorkloadWithSource);
	registerCommand(CommandId.FluxReconcileWorkload, fluxReconcileWorkload);
	registerCommand(CommandId.FluxEnableGitOps, fluxEnableGitOps);
	registerCommand(CommandId.FluxDisableGitOps, fluxDisableGitOps);
	registerCommand(CommandId.FluxTrace, trace);

	// tree views
	registerCommand(CommandId.SetClusterProvider, setClusterProvider);
	registerCommand(CommandId.RefreshAllTreeViews, refreshAllTreeViewsCommand);
	registerCommand(CommandId.RefreshResourcesTreeView, refreshResourcesTreeViewsCommand);
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
			telemetry.sendError(TelemetryError.UNCAUGHT_EXCEPTION, e as Error);
			window.showErrorMessage(String(e));
			console.error(e);
		}
	}, thisArg);

	// When this extension is deactivated the disposables will be disposed.
	_context.subscriptions.push(command);
}

