import { Disposable, ExtensionContext, Terminal, window } from 'vscode';
import { extensionContext } from 'extension';

const terminalName = 'gitops';

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
				_disposable?.dispose();
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
 * @param command Command name.
 * @param cwd Optional working directory path to cd to.
 * @param focusTerminal Optional whether or not to shift the focus to the terminal.
 */
export function runTerminalCommand(
	command: string,
	{
		cwd,
		focusTerminal,
	}: {
		cwd?: string;
		focusTerminal?: boolean;
	} = {}): void {

	const terminal = getTerminal(extensionContext, cwd);
	terminal.show(!focusTerminal);
	terminal.sendText(command, true);
}
