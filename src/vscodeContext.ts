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

	OpenFolderGitRepositoryExistDetermined = 'gitops:openFolderGitRepositoryExistDetermined',
	OpenFolderGitRepositoryExist = 'gitops:openFolderGitRepositoryExist',

	IsDev = 'gitops:isDev',
}

/**
 * Mapping between context name and value.
 */
interface ContextValues {
	[ContextTypes.NoClusterSelected]: boolean;
	[ContextTypes.CurrentClusterGitOpsNotEnabled]: boolean;

	[ContextTypes.LoadingClusters]: boolean;
	[ContextTypes.LoadingSources]: boolean;
	[ContextTypes.LoadingWorkloads]: boolean;

	[ContextTypes.FailedToLoadClusterContexts]: boolean;
	[ContextTypes.NoClusters]: boolean;
	[ContextTypes.NoSources]: boolean;
	[ContextTypes.NoWorkloads]: boolean;

	[ContextTypes.OpenFolderGitRepositoryExist]: boolean;
	[ContextTypes.OpenFolderGitRepositoryExistDetermined]: boolean;

	[ContextTypes.IsDev]: boolean;
}

/**
 * GitOps context key.
 */
export type ContextKey = keyof ContextValues;

/**
 * Type-safe way to set context for future use in:
 * menus, keybindings, welcomeView...
 */
export async function setVSCodeContext<T extends ContextKey>(context: T, value: ContextValues[T]) {
	return await commands.executeCommand(CommandId.VSCodeSetContext, context, value);
}
