import { commands } from 'vscode';
import { CommandId } from './commands';

/**
 * GitOps context types.
 */
export const enum ContextTypes {
	NoClusterSelected = 'gitops:noClusterSelected',
	CurrentClusterFluxNotInstalled = 'gitops:currentClusterFluxNotInstalled',
	LoadingSources = 'gitops:loadingSources',
	LoadingWorkloads = 'gitops:loadingWorkloads',
	NoSources = 'gitops:noSources',
	NoWorkloads = 'gitops:noWorkloads',

	OpenFolderGitRepositoryExistDetermined = 'gitops:openFolderGitRepositoryExistDetermined',
	OpenFolderGitRepositoryExist = 'gitops:openFolderGitRepositoryExist',
}

/**
 * Mapping between context name and value.
 */
interface ContextValues {
	[ContextTypes.NoClusterSelected]: boolean;
	[ContextTypes.CurrentClusterFluxNotInstalled]: boolean;
	[ContextTypes.LoadingSources]: boolean;
	[ContextTypes.LoadingWorkloads]: boolean;
	[ContextTypes.NoSources]: boolean;
	[ContextTypes.NoWorkloads]: boolean;

	[ContextTypes.OpenFolderGitRepositoryExist]: boolean;
	[ContextTypes.OpenFolderGitRepositoryExistDetermined]: boolean;
}

/**
 * GitOps context key.
 */
export type ContextKey = keyof ContextValues;

/**
 * Type-safe way to set context for future use in:
 * menus, keybindings, welcomeView...
 */
export async function setContext<T extends ContextKey>(context: T, value: ContextValues[T]) {
	return await commands.executeCommand(CommandId.VSCodeSetContext, context, value);
}
