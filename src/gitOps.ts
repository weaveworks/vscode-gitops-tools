import {
  Disposable,
  ExtensionContext,
  Terminal,
  window
} from 'vscode';

const terminalName: string = 'gitops';

let _terminal: Terminal | undefined;
let _currentDirectory: string | undefined;
let _disposable: Disposable | undefined;

/**
 * Gets gitops treminal instance.
 * @param context VScode extension context.
 * @param workingDirectory Optional working directory path to cd to.
 * @returns
 */
function getTerminal(context: ExtensionContext, workingDirectory?: string): Terminal {
	if (_terminal === undefined) {
		_terminal = window.createTerminal(terminalName);
		_disposable = window.onDidCloseTerminal((e: Terminal) => {
			if (e.name === terminalName) {
				_terminal = undefined;
				_disposable!.dispose();
				_disposable = undefined;
			}
		});

		context.subscriptions.push(_disposable);
		_currentDirectory = undefined;
	}

	if (_currentDirectory !== workingDirectory &&
			workingDirectory && workingDirectory.length > 0) {
		_terminal.sendText(`cd "${workingDirectory}"`, true); // add new line
		_currentDirectory = workingDirectory;
	}

	return _terminal;
}

/**
 * Runs terminal command.
 * @param context VSCode extension context.
 * @param command Command name.
 * @param args Command arguments.
 * @param workingDirectory Optional working directory path to cd to.
 */
export function runTerminalCommand(
	context: ExtensionContext,
  command: string,
  args: string,
  workingDirectory?: string): void {
  const terminal = getTerminal(context, workingDirectory);
	terminal.show(true);
	terminal.sendText(`${command} ${args}`, true); // add new line
}
