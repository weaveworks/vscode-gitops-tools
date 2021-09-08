import { commands } from 'vscode';

/** Mapping between context name and context value. */
interface VscodeContextTypes {
	['gitops:noClusterSelected']: boolean;
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

