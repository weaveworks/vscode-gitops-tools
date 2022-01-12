import extractZip from 'extract-zip';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { Errorable } from '../errorable';
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
export async function downloadFile(url: string, filePath: string): Promise<Errorable<true>> {
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
					downloadFile(location, filePath).then(() => resolve({
						succeeded: true,
						result: true,
					}));
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
				result: true,
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
 * Create a directory.
 */
export async function createDir(dirPath: string): Promise<Errorable<null>> {
	return new Promise(resolve => {
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

