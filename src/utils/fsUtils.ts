import { exec } from 'child_process';
import extractZip from 'extract-zip';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { Errorable } from '../types/errorable';
import { shell } from '../shell';

/**
 * Wrap file path in quotes depending on the user os.
 * (To allow paths with whitespaces, for example).
 *
 * @param fsPath target file system path
 * @returns quoted file system path
 */
export function quoteFsPath(fsPath: string) {
	const quoteSymbol = shell.isWindows() ? '"' : '\'';
	return `${quoteSymbol}${fsPath}${quoteSymbol}`;
}

/**
 * Download file from url (probably only https protocol).
 *
 * @param url target url
 * @param filePath local destination file path
 */
export async function downloadFile(url: string, filePath: string): Promise<Errorable<null>> {
	return new Promise(resolve => {

		const file = fs.createWriteStream(filePath);
		const request = https.get(url, response => {
			if (response.statusCode === 200) {
				response.pipe(file);
			} else if(response.statusCode === 301 || response.statusCode === 302) {
				// recursively follow redirects
				const location = response.headers.location;
				if (!location) {
					resolve({
						succeeded: false,
						error: [`Response status is ${response.statusCode}, but "headers.location" is missing.`],
					});
				} else {
					downloadFile(location, filePath).then(() => {
						file.close();
						resolve({
							succeeded: true,
							result: null,
						});
					});
				}
			} else {
				file.close();
				fs.unlink(filePath, () => {});
				resolve({
					succeeded: false,
					error: [`Response error: ${response.statusCode} ${response.statusMessage}`],
				});
			}
		});

		file.on('finish', function() {
			resolve({
				succeeded: true,
				result: null,
			});
		});

		request.on('error', err => {
			file.close();
			fs.unlink(filePath, () => {});
			resolve({
				succeeded: false,
				error: [err.message],
			});
		});
		file.on('error', err => {
			file.close();
			fs.unlink(filePath, () => {});
			resolve({
				succeeded: false,
				error: [err.message],
			});
		});
	});
}

/**
 * Extract `.zip` file contents into a folder with the same name,
 * e.g. `C:\Users\USER_NAME\AppData\Local\Temp\flux_0.24.1_windows_amd64.zip`
 * extracts into a new folder `C:\Users\USER_NAME\AppData\Local\Temp\flux_0.24.1_windows_amd64`
 *
 * @returns extracted folder path
 */
export async function unzipFile(filePath: string): Promise<Errorable<string>> {
	return new Promise(async resolve => {
		try {
			const extractedFolderPath = path.join(path.dirname(filePath), path.basename(filePath, '.zip'));
			await extractZip(filePath, { dir: extractedFolderPath });
			resolve({
				succeeded: true,
				result: extractedFolderPath,
			});
		} catch (err) {
			resolve({
				succeeded: false,
				error: [String(err)],
			});
		}
	});
}

/**
 * Move file from one location on disk to another.
 */
export async function moveFile(filePath: string, destinationPath: string): Promise<Errorable<null>> {
	return new Promise(resolve => {
		fs.rename(filePath, destinationPath, err => {
			if (err) {
				resolve({
					succeeded: false,
					error: [err.message],
				});
			} else {
				resolve({
					succeeded: true,
					result: null,
				});
			}
		});
	});
}

/**
 * Create a directory (ignore if exists).
 */
export async function createDir(dirPath: string): Promise<Errorable<null>> {
	return new Promise(resolve => {
		// ignore if exists
		if (fs.existsSync(dirPath)) {
			return resolve({
				succeeded: true,
				result: null,
			});
		}
		fs.mkdir(dirPath, err => {
			if (err) {
				resolve({
					succeeded: false,
					error: [err.message],
				});
			} else {
				resolve({
					succeeded: true,
					result: null,
				});
			}
		});
	});
}

/**
 * Get path to the folder to install/move an executable into.
 * For example `C:\Users\USER_NAME\AppData\Roaming` on Windows OS
 */
export function getAppdataPath(): Errorable<string> {
	if (process.env.APPDATA) {
		return {
			succeeded: true,
			result: process.env.APPDATA,
		};
	}

	const HOME = process.env.HOME;
	if (!HOME) {
		return {
			succeeded: false,
			error: ['APPDATA env variable is not set, HOME env variable is also not set'],
		};
	}

	return {
		succeeded: true,
		result: path.join(HOME, process.platform === 'darwin' ? '/Library/Preferences' : '/.local/share'),
	};
}

/**
 * Add fs path to the PATH environment variable (Windows OS).
 * Doesn't require elevating.
 */
export async function appendToPathEnvironmentVariableWindows(pathToAppend: string): Promise<Errorable<null>> {
	return new Promise(resolve => {
		const powershellScript = `
$oldPath = [Environment]::GetEnvironmentVariable('PATH', 'User');
[Environment]::SetEnvironmentVariable('PATH', "${path.normalize(pathToAppend)};$oldPath",'User');

# because sometimes explorer.exe just doesn't get the message that things were updated.
if (-not ("win32.nativemethods" -as [type])) {
		# import sendmessagetimeout from win32
		add-type -Namespace Win32 -Name NativeMethods -MemberDefinition @"
[DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
public static extern IntPtr SendMessageTimeout(
IntPtr hWnd, uint Msg, UIntPtr wParam, string lParam,
uint fuFlags, uint uTimeout, out UIntPtr lpdwResult);
"@
}

$HWND_BROADCAST = [intptr]0xffff;
$WM_SETTINGCHANGE = 0x1a;
$result = [uintptr]::zero

# notify all windows of environment block change
[win32.nativemethods]::SendMessageTimeout($HWND_BROADCAST, $WM_SETTINGCHANGE,  [uintptr]::Zero, "Environment", 2, 5000, [ref]$result) | Out-Null
`;
		exec(powershellScript, { 'shell':'powershell.exe' }, (error, stdout, stderr) => {
			if (error || stderr) {
				resolve({
					succeeded: false,
					error: [error?.message || stderr],
				});
			} else {
				resolve({
					succeeded: true,
					result: null,
				});
			}
		});
	});
}

/**
 * Read file from disk (async).
 * Return file contents `toString()`
 */
export async function readFile(filePath: string): Promise<Errorable<string>> {
	return new Promise(resolve => {
		fs.readFile(filePath, (err, data) => {
			if (err) {
				return resolve({
					succeeded: false,
					error: [err.message],
				});
			} else {
				return resolve({
					succeeded: true,
					result: data.toString(),
				});
			}
		});
	});
}
/**
 * Delete file from disk (async).
 */
export async function deleteFile(filePath: string): Promise<Errorable<null>> {
	return new Promise(resolve => {
		fs.unlink(filePath, err => {
			if (err) {
				resolve({
					succeeded: false,
					error: [err.message],
				});
			} else {
				resolve({
					succeeded: true,
					result: null,
				});
			}
		});
	});
}
