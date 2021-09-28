import { ChildProcess } from 'child_process';
import * as shelljs from 'shelljs';
import { window, workspace } from 'vscode';
import { sendToOutputChannel } from './output';
import { statusBar } from './statusBar';

// 🚧 WORK IN PROGRESS.

/**
 * Get setting value of Kubernetes extension
 * of whether or not to use wsl on windows.
 *
 * TODO: remove wsl? This setting is not documented and may be removed in the future:
 * https://github.com/Azure/vscode-kubernetes-tools/issues/695#issuecomment-606047328
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

export interface Shell {
    isWindows(): boolean;
    isUnix(): boolean;
    platform(): Platform;
    exec(cmd: string, stdin?: string): Promise<ShellResult | undefined>;
    execCore(cmd: string, opts: any, callback?: (proc: ChildProcess) => void, stdin?: string): Promise<ShellResult>;
		execWithOutput(cmd: string, revealOutputView?: boolean): Promise<ShellResult | undefined>;
		// fileUri(filePath: string): Uri;
		// home(): string;
		// combinePath(basePath: string, relativePath: string): string;
		// execOpts(): any;
    // execStreaming(cmd: string, callback: ((proc: ChildProcess) => void) | undefined): Promise<ShellResult | undefined>;
    // unquotedPath(path: string): string;
    // which(bin: string): string | null;
    // cat(path: string): string;
    // ls(path: string): string[];
}

export const shell: Shell = {
    isWindows : isWindows,
    isUnix : isUnix,
    platform : platform,
    exec : exec,
    execCore : execCore,
		execWithOutput: execWithOutput,
};

const WINDOWS: string = 'win32';

export interface ShellResult {
    readonly code: number;
    readonly stdout: string;
    readonly stderr: string;
}

export type ShellHandler = (code: number, stdout: string, stderr: string) => void;

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

function execOpts(): any {
    // let env = process.env;
    // if (isWindows()) {
    //     env = Object.assign({ }, env, { HOME: home() });
    // }
    // env = shellEnvironment(env);
    const opts: shelljs.ExecOptions = {
        // cwd: workspace.rootPath,
        // env: env,
        async: true,
    };
    return opts;
}

async function exec(cmd: string, stdin?: string): Promise<ShellResult | undefined> {
    try {
        return await execCore(cmd, execOpts(), null, stdin);
    } catch (ex) {
        window.showErrorMessage(String(ex));
        return undefined;
    }
}

/**
 * Execute command in cli and send the text to vscode output view.
 * @param cmd CLI command string
 * @param revealOutputView Whether or not to show output view.
 */
async function execWithOutput(cmd: string, revealOutputView: boolean = true) {
	return new Promise<ShellResult>((resolve) => {
		statusBar.show('GitOps: Running CLI command');
		sendToOutputChannel(`> ${cmd}`, true, revealOutputView);

		const childProcess = shelljs.exec(cmd, { async: true });
		let stdout = '';
		let stderr = '';
		childProcess.stdout?.on('data', function(data) {
			stdout += data;
			sendToOutputChannel(data, false, false);
			statusBar.show(data.split('\n')[0]);
		});
		childProcess.stderr?.on('data', function(data) {
			stderr += data;
			sendToOutputChannel(data, false, false);
			statusBar.show(data.split('\n').filter((line: string) => Boolean(line)).pop());
		});
		childProcess.on('exit', function(code: number) {
			statusBar.hide();
			resolve({
				code,
				stdout,
				stderr,
			});
		});
	});
}

function execCore(cmd: string, opts: any, callback?: ((proc: ChildProcess) => void) | null, stdin?: string): Promise<ShellResult> {
    return new Promise<ShellResult>((resolve) => {
        if (getUseWsl()) {
            cmd = 'wsl ' + cmd;
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
