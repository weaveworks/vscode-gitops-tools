import { commands } from 'vscode';
import { CommandId } from './commands';

/**
 * GitOps context types.
 */
export const enum ContextTypes {
	NoClusterSelected = 'gitops:noClusterSelected',
	CurrentClusterGitOpsNotEnabled = 'gitops:currentClusterGitOpsNotEnabled',

	LoadingClusters = 'gitops:loadingClusters',
	LoadingSources = 'gitops:loadingSources',
	LoadingWorkloads = 'gitops:loadingWorkloads',

	FailedToLoadClusterContexts = 'gitops:failedToLoadClusterContexts',
	NoClusters = 'gitops:noClusters',
	NoSources = 'gitops:noSources',
	NoWorkloads = 'gitops:noWorkloads',

	IsDev = 'gitops:isDev',
	IsWGE = 'gitops:isWGE',
}


/**
 * Type-safe way to set context for future use in:
 * menus, keybindings, welcomeView...
 */
export async function setVSCodeContext(context: ContextTypes, value: boolean) {
	return await commands.executeCommand(CommandId.VSCodeSetContext, context, value);
}
