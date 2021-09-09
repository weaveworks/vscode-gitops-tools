import { commands } from 'vscode';

const enum DynamicContexts {
	NoClusterSelected = 'gitops:noClusterSelected',
}

/** Mapping between context name and context value. */
interface VscodeContextTypes {
	[DynamicContexts.NoClusterSelected]: boolean;
}
/** VSCode context names */
export type ContextKey = keyof VscodeContextTypes;
/**
 * Type-safe way to set vscode context for future use in:
 * menus, keybindings, welcomeView...
 */
export async function setVscodeContext<T extends ContextKey>(context: T, value: VscodeContextTypes[T]) {
	return await commands.executeCommand('setContext', context, value);
}

