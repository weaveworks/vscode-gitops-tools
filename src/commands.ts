import {
  Disposable,
  ExtensionContext,
  Uri,
  commands,
  window
}
from 'vscode';
import {runTerminalCommand} from './gitOps';

/**
 * Bulit-in VSCode commands.
 */
export enum BuiltInCommands {
  Open = 'vscode.open'
}

/**
 * Kubectl commands.
 */
export enum KubectlCommands {
	Version = 'gitops.kubectl.version'
}

let _context: ExtensionContext;

/**
 * Registers GitOps extension commands.
 * @param context VSCode extension context.
 */
export function registerCommands(context: ExtensionContext) {
  _context = context;
  registerCommand(KubectlCommands.Version, showKubectlVersion);
}

/**
 * Registers vscode extension command.
 * @param commandName Command name.
 * @param callback Command handler.
 * @param thisArg The `this` context used when invoking the handler function.
 * @returns Disposable which unregisters this command on disposal.
 */
function registerCommand(commandName: string, callback: (...args: any[]) => any, thisArg?: any): Disposable {
  const command: Disposable = commands.registerCommand(commandName, callback);
  _context.subscriptions.push(command);
  return command;
}

/**
 * Outputs kubectl version in gitops terminal.
 */
async function showKubectlVersion() {
	runTerminalCommand(_context, 'kubectl', 'version');
}
