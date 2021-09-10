import { commands } from 'vscode';
import { BuiltInCommands } from './commands';

/**
 * GitOps context types.
 */
export const enum ContextTypes {
	NoClusterSelected = 'gitops:noClusterSelected',
}

/**
 * Mapping between context name and value.
 **/
interface ContextValues {
	[ContextTypes.NoClusterSelected]: boolean;
}

/**
 * GitOps context key.
 **/
export type ContextKey = keyof ContextValues;

/**
 * Type-safe way to set context for future use in:
 * menus, keybindings, welcomeView...
 */
export async function setContext<T extends ContextKey>(context: T, value: ContextValues[T]) {
	return await commands.executeCommand(BuiltInCommands.SetContext, context, value);
}
