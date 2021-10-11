import { ChildProcess } from 'child_process';
import * as shelljs from 'shelljs';
import { ProgressLocation, window, workspace } from 'vscode';
import { sendToOutputChannel } from './output';

// 🚧 WORK IN PROGRESS.

/**
 * Get setting value of Kubernetes extension
 * of whether or not to use wsl on windows.
 *
 * Undocumented setting:
 * https://github.com/Azure/vscode-kubernetes-tools/issues/695
 */
export function getUseWsl(): boolean {
	return workspace.getConfiguration('vs-kubernetes')['use-wsl'];
}

/**
 * User OS.
 */
export const enum Platform {
	Windows,
	MacOS,
	Linux,
	Unsupported,  // shouldn't happen!
}

export type ExecCallback = shelljs.ExecCallback;

const WINDOWS: string = 'win32';

export interface ShellResult {
	readonly code: number;
	readonly stdout: string;
	readonly stderr: string;
}

export type ShellHandler = (code: number, stdout: string, stderr: string)=> void;

/**
 * Return `true` when user has windows OS.
 */
function isWindows(): boolean {
	return (process.platform === WINDOWS) && !getUseWsl();
}

/**
 * Return `true` when user has Unix OS.
 */
function isUnix(): boolean {
	return !isWindows();
}

/**
 * Return user platform.
 * For WSL - return Linux.
 */
function platform(): Platform {
	if (getUseWsl()) {
		return Platform.Linux;
	}
	switch (process.platform) {
		case 'win32': return Platform.Windows;
		case 'darwin': return Platform.MacOS;
		case 'linux': return Platform.Linux;
		default: return Platform.Unsupported;
	}
}

function execOpts({ cwd }: { cwd?: string; } = {}): any {
	// let env = process.env;
	// if (isWindows()) {
	//     env = Object.assign({ }, env, { HOME: home() });
	// }
	// env = shellEnvironment(env);
	const opts: shelljs.ExecOptions = {
		cwd: cwd,
		// env: env,
		async: true,
	};
	return opts;
}

async function exec(cmd: string, { cwd }: { cwd?: string; } = {}): Promise<ShellResult | undefined> {
	try {
		return await execCore(cmd, execOpts({ cwd }), null);
	} catch (e) {
		console.error(e);
		window.showErrorMessage(String(e));
		return undefined;
	}
}

/**
 * Execute command in cli and send the text to vscode output view.
 * @param cmd CLI command string
 */
async function execWithOutput(
	cmd: string,
	{
		revealOutputView = true,
		cwd,
	}: {
		revealOutputView?: boolean;
		cwd?: string;
	} = {}): Promise<ShellResult> {

	// Show vscode notification loading message
	return window.withProgress({
		location: ProgressLocation.Notification,
		title: 'GitOps Running: ',
	}, async progress => new Promise<ShellResult>(resolve => {
		sendToOutputChannel(`> ${cmd}`, true, revealOutputView);

		const childProcess = shelljs.exec(cmd, {
			async: true,
			cwd: cwd,
		});

		let stdout = '';
		let stderr = '';

		childProcess.stdout?.on('data', function(data) {
			stdout += data;
			sendToOutputChannel(data, false, false);
			progress.report({
				message: data,
			});
		});
		childProcess.stderr?.on('data', function(data) {
			stderr += data;
			sendToOutputChannel(data, false, false);
			progress.report({
				message: data,
			});
		});

		childProcess.on('exit', function(code: number) {
			resolve({
				code,
				stdout,
				stderr,
			});
		});
	}));
}

function execCore(cmd: string, opts: any, callback?: ((proc: ChildProcess)=> void) | null, stdin?: string): Promise<ShellResult> {
	return new Promise<ShellResult>(resolve => {
		if (getUseWsl()) {
			cmd = `wsl ${cmd}`;
		}
		const proc = shelljs.exec(cmd, opts, (code, stdout, stderr) => resolve({code : code, stdout : stdout, stderr : stderr}));
		if (stdin) {
			proc.stdin?.end(stdin);
		}
		if (callback) {
			callback(proc);
		}
	});
}

export const shell = {
	isWindows : isWindows,
	isUnix : isUnix,
	platform : platform,
	exec : exec,
	execCore : execCore,
	execWithOutput: execWithOutput,
};
