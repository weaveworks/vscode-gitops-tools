import {
	commands,
	window,
	workspace,
	Disposable,
	ExtensionContext,
	Uri
} from 'vscode';
import { runTerminalCommand } from './gitOps';
import { kubernetesTools } from './kubernetes/kubernetesTools';
import { refreshTreeViews } from './views/treeViews';

/**
 * GitOps/vscode editor commands.
 */
export enum EditorCommands {
	OpenResource = 'gitops.editor.openResource'
}

/**
 * GitOps View commands.
 */
export enum ViewCommands {
	Open = 'vscode.open',
	SetContext = 'setContext',
	RefreshTreeViews = 'gitops.views.refreshTreeViews',
}

/**
 * Kubectl commands.
 */
export enum KubectlCommands {
	Version = 'gitops.kubectl.version',
	SetCurrentContext = 'gitops.kubectl.setCurrentContext',
}

/**
 * Flux commands.
 */
 export enum FluxCommands {
	CheckPrerequisites = 'gitops.flux.checkPrerequisites'
}

let _context: ExtensionContext;

/**
 * Registers GitOps extension commands.
 * @param context VSCode extension context.
 */
export function registerCommands(context: ExtensionContext) {
  _context = context;
  registerCommand(KubectlCommands.Version, showKubectlVersion);
	registerCommand(KubectlCommands.SetCurrentContext, setKubernetesClusterContext);
	registerCommand(ViewCommands.RefreshTreeViews, refreshTreeViews);
	registerCommand(FluxCommands.CheckPrerequisites, checkFluxPrerequisites);

	// add open gitops resource in vscode editor command
	context.subscriptions.push(
    commands.registerCommand(EditorCommands.OpenResource, (uri: Uri) => {
      workspace.openTextDocument(uri).then((document) => {
				if (document) {
					window.showTextDocument(document);
				}
      },
			(error) => window.showErrorMessage(`Error loading document: ${error}`));
    })
  );
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

/**
 * Runs Flux check --pre command in gitops terminal.
 */
 async function checkFluxPrerequisites() {
	runTerminalCommand(_context, 'flux', 'check --pre');
}

/**
 * Sets Kubernetes cluster context.
 * @param contextName Kubernetes cluster context name.
 */
export async function setKubernetesClusterContext(contextName: string) {
	const success = await kubernetesTools.setCurrentContext(contextName);
	if (success) {
		refreshTreeViews();
	}
}
