import { ChildProcess } from 'child_process';
import * as shelljs from 'shelljs';
import { workspace, Progress, ProgressLocation, window } from 'vscode';
import { globalState } from './extension';
import { GlobalStateKey } from './globalState';
import { output } from './output';

// 🚧 WORK IN PROGRESS.

/**
 * Ignore `"vs-kubernetes.use-wsl" setting.
 * Always return false.
 *
 * Get setting value of Kubernetes extension
 * of whether or not to use wsl on windows.
 *
 * Undocumented setting:
 * https://github.com/Azure/vscode-kubernetes-tools/issues/695
 *
 * Possibly removed:
 * https://github.com/vscode-kubernetes-tools/vscode-kubernetes-tools/issues/1031
 */
export function getUseWsl(): boolean {
	// ignore upstream repository undocumented setting when
	// running any cli commands from this extension
	return false;
	// return workspace.getConfiguration('vs-kubernetes')['use-wsl'];
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

const WINDOWS = 'win32';

export interface ShellResult {
	readonly code: number;
	readonly stdout: string;
	readonly stderr: string;
}
/**
 * Return shell error and code.
 */
export function shellCodeError(shellResult?: ShellResult) {
	return `Error: ${shellResult?.stderr}. Code: ${shellResult?.code}`;
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

function execOpts({ cwd }: { cwd?: string; } = {}): shelljs.ExecOptions {
	let env = process.env;

	if (isWindows() || isUnix()) {
		let kubeconfigPath = workspace.
			getConfiguration('vs-kubernetes')['vs-kubernetes.kubeconfig'];

		if(typeof kubeconfigPath === 'string' && kubeconfigPath !== '') {
			env['KUBECONFIG'] = kubeconfigPath;
		}

		if (isWindows()) {
			const fluxPath = globalState.get(GlobalStateKey.FluxPath);
			if (fluxPath) {
				env.Path += `;${fluxPath}`;
			}
		}
	}

	const opts: shelljs.ExecOptions = {
		cwd: cwd,
		env: env,
		async: true,
	};
	return opts;
}

async function exec(cmd: string, { cwd }: { cwd?: string; } = {}): Promise<ShellResult> {
	try {
		return await execCore(cmd, execOpts({ cwd }), null);
	} catch (e) {
		console.error(e);
		window.showErrorMessage(String(e));
		return {
			code: 2,
			stdout: '',
			stderr: `Failed to execute ${e}`,
		};
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
		showProgress = true,
		cwd,
	}: {
		revealOutputView?: boolean;
		showProgress?: boolean;
		cwd?: string;
	} = {}): Promise<ShellResult> {

	if (showProgress) {
		// Show vscode notification loading message
		return window.withProgress({
			location: ProgressLocation.Notification,
			title: 'GitOps Running',
		}, innerExec);
	} else {
		// No progress
		const progressNoop = {
			report: () => undefined,
		};
		return innerExec(progressNoop);
	}

	async function innerExec(progress: Progress<{ message?: string | undefined; increment?: number | undefined; }>) {
		 return new Promise<ShellResult>(resolve => {
			output.send(`> ${cmd}`, { newline: 'single', revealOutputView });

			const childProcess = shelljs.exec(cmd, {
				async: true,
				cwd: cwd,
				env: execOpts().env,
			});

			let stdout = '';
			let stderr = '';

			childProcess.stdout?.on('data', (data: string) => {
				stdout += data;
				output.send(data, { newline: 'none', revealOutputView: false });
				progress.report({
					message: data,
				});
			});
			childProcess.stderr?.on('data', (data: string) => {
				stderr += data;
				output.send(data, { newline: 'none', revealOutputView: false });
				progress.report({
					message: data,
				});
			});

			childProcess.on('exit', (code: number) => {
				output.send('\n', { newline: 'none', revealOutputView: false });

				resolve({
					code,
					stdout,
					stderr,
				});
			});
		});
	}
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
	// execCore : execCore,
	execWithOutput: execWithOutput,
};
