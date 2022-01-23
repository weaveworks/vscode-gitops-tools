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

	NoClusters = 'gitops:noClusters',
	NoSources = 'gitops:noSources',
	NoWorkloads = 'gitops:noWorkloads',

	OpenFolderGitRepositoryExistDetermined = 'gitops:openFolderGitRepositoryExistDetermined',
	OpenFolderGitRepositoryExist = 'gitops:openFolderGitRepositoryExist',

	IsDev = 'gitops:isDev',
	/**
	 * For button enablement - don't let user press the buttons
	 * that have "enablement" set at the moment when extension is just starting up.
	 */
	IsStartupFinished = 'gitops:isStartupFinished',
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

	[ContextTypes.NoClusters]: boolean;
	[ContextTypes.NoSources]: boolean;
	[ContextTypes.NoWorkloads]: boolean;

	[ContextTypes.OpenFolderGitRepositoryExist]: boolean;
	[ContextTypes.OpenFolderGitRepositoryExistDetermined]: boolean;

	[ContextTypes.IsDev]: boolean;
	[ContextTypes.IsStartupFinished]: boolean;
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
