import { commands } from 'vscode';
import { ViewCommands } from './commands';

/**
 * GitOps context types.
 */
export const enum ContextTypes {
	NoClusterSelected = 'gitops:noClusterSelected',
	CurrentClusterFluxNotInstalled = 'gitops:currentClusterFluxNotInstalled',
	LoadingSources = 'gitops:loadingSources',
	LoadingApplications = 'gitops:loadingApplications',
	NoSources = 'gitops:noSources',
	NoApplications = 'gitops:noApplications',
}

/**
 * Mapping between context name and value.
 */
interface ContextValues {
	[ContextTypes.NoClusterSelected]: boolean;
	[ContextTypes.CurrentClusterFluxNotInstalled]: boolean;
	[ContextTypes.LoadingSources]: boolean;
	[ContextTypes.LoadingApplications]: boolean;
	[ContextTypes.NoSources]: boolean;
	[ContextTypes.NoApplications]: boolean;
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
	return await commands.executeCommand(ViewCommands.SetContext, context, value);
}
