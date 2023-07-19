import fs from 'fs';
import { IncomingMessage } from 'http';
import https from 'https';
import os from 'os';
import path from 'path';
import request from 'request';
import { commands, window } from 'vscode';

import { Platform, shell } from 'cli/shell/exec';
import { output } from 'cli/shell/output';
import { runTerminalCommand } from 'cli/shell/terminal';
import { GlobalStateKey } from 'data/globalState';
import { globalState } from 'extension';
import { Errorable, failed } from 'types/errorable';
import { refreshAllTreeViewsCommand } from 'commands/refreshTreeViews';
import { appendToPathEnvironmentVariableWindows, createDir, deleteFile, downloadFile, getAppdataPath, moveFile, readFile, unzipFile } from 'utils/fsUtils';

const fluxGitHubUserProject = 'fluxcd/flux2';

/**
 * Get latest version tag from releases of the specified project.
 *
 * @param gitHubUserProject user/project string e.g. `fluxcd/flux2`
 * @returns version string e.g. `0.24.1`
 */
async function getLatestVersionFromGitHub(gitHubUserProject: string): Promise<Errorable<string>> {
	return new Promise(resolve => {
		https.get(`https://github.com/${gitHubUserProject}/releases/latest`, (res: IncomingMessage) => {

			const location = res.headers.location;
			if (!location) {
				resolve({
					succeeded: false,
					error: [`Failed to get latest ${gitHubUserProject} version: No location in response.`],
				});
				return;
			}

			const latestVersion = location.split('/').pop()?.replace(/^v/, '');
			if (!latestVersion) {
				resolve({
					succeeded: false,
					error: ['Failed to parse version from the location header.'],
				});
				return;
			}

			resolve({
				succeeded: true,
				result: latestVersion,
			});

		}).on('error', err => {
			resolve({
				succeeded: false,
				error: [err.message],
			});
		});
	});
}

/**
 * Download a `checksums.txt` file from the Flux GitHub repository
 * and return it's path on the disk in case of success.
 */
async function downloadFluxChecksums(latestFluxVersion: string): Promise<Errorable<string>> {
	const checksumsFileName = `flux_${latestFluxVersion}_checksums.txt`;
	const downloadLink = `https://github.com/${fluxGitHubUserProject}/releases/latest/download/${checksumsFileName}`;
	const localChecksumPath = path.join(os.tmpdir(), checksumsFileName);
	const downloadChecksumResult = await downloadFile(downloadLink, localChecksumPath);
	if (failed(downloadChecksumResult)) {
		return {
			succeeded: false,
			error: downloadChecksumResult.error,
		};
	} else {
		return {
			succeeded: true,
			result: localChecksumPath,
		};
	}
}
/**
 * Checksum has format:
 * ```
 * 059c316af1f931d49850e67149cc1d7e094483b58060e597e61b134e12395157  flux_0.25.2_darwin_amd64.tar.gz
 * 2b85eec684b245bbc545cd0f3a1429930d48c48fec5baff410a87577bc21458d  flux_0.25.2_windows_386.zip
 * ```
 */
function checkChecksum(checksumFileContents: string, targetFileName: string, computedChecksum: string): Errorable<null> {
	const lines = checksumFileContents.split('\n')
		.filter(line => line.length)
		.map(line => line.split('  '));

	const targetLine = lines.find(line => line[1] === targetFileName);
	if (!targetLine) {
		return {
			succeeded: false,
			error: [`File not found in the checksums.txt file ${targetFileName}`],
		};
	}

	if (targetLine[0] === computedChecksum) {
		return {
			succeeded: true,
			result: null,
		};
	} else {
		return {
			succeeded: false,
			error: [`Checksum mismatch for the file ${targetFileName}`],
		};
	}
}

/**
 * Compute checksum of the file on Windows OS using built-in `CertUtil`.
 */
async function computeChecksumWindows(filePath: string, hashAlgorithm: 'MD5' | 'SHA1' | 'SHA256' | 'SHA384' | 'SHA512'): Promise<Errorable<string>> {
	const shellResult = await shell.exec(`CertUtil -hashfile "${filePath}" ${hashAlgorithm}`);
	if (shellResult.code === 0) {
		const checksum = shellResult.stdout.split('\n')[1]?.trim();
		if (checksum) {
			return {
				succeeded: true,
				result: checksum,
			};
		}
	}

	return {
		succeeded: false,
		error: [`Failed to compute checksum of the file "${filePath}". ${shellResult?.stderr || shellResult?.stdout}`],
	};
}

/**
 * Install flux2 cli on the user machine https://github.com/fluxcd/flux2
 */
export async function installFluxCli() {

	const platform = shell.platform();
	if (platform === Platform.Unsupported) {
		window.showErrorMessage(`Unsupported platform ${process.platform}`);
		return;
	}

	if (platform === Platform.Windows) {
		const latestFluxVersionResult = await getLatestVersionFromGitHub(fluxGitHubUserProject);
		if (failed(latestFluxVersionResult)) {
			window.showErrorMessage(`Failed to infer the latest Flux version ${latestFluxVersionResult.error[0]}`);
			return;
		}

		output.send(`✔ Latest Flux version: ${latestFluxVersionResult.result}`, { revealOutputView: true, newline: 'single' });

		const archString = os.arch() === 'arm64' ? 'arm64' : 'x64' ? 'amd64' : '386';
		const gitHubAssetArchiveName = `flux_${latestFluxVersionResult.result}_windows_${archString}.zip`;
		const downloadLink = `https://github.com/${fluxGitHubUserProject}/releases/latest/download/${gitHubAssetArchiveName}`;
		const localArchiveFilePath = path.join(os.tmpdir(), gitHubAssetArchiveName);

		const downloadResult = await downloadFile(downloadLink, localArchiveFilePath);
		if (failed(downloadResult)) {
			window.showErrorMessage(`File download failed: ${downloadResult.error[0]}`);
			return;
		}

		output.send(`✔ ${downloadLink} downloaded`, { newline: 'single' });

		const unzipResult = await unzipFile(localArchiveFilePath);
		if (failed(unzipResult)) {
			window.showErrorMessage(`File unzip failed: ${unzipResult.error[0]}`);
			return;
		}

		output.send(`✔ Extracted: "${localArchiveFilePath}"`, { newline: 'single' });

		const appDataPathResult = getAppdataPath();
		if (failed(appDataPathResult)) {
			window.showErrorMessage(appDataPathResult.error[0]);
			return;
		}

		const executablePath = path.join(unzipResult.result, 'flux.exe');
		const appDataFluxExecutablePath = path.join(appDataPathResult.result, 'flux', 'flux.exe');

		const createDirResult = await createDir(path.join(appDataPathResult.result, 'flux'));
		if (failed(createDirResult)) {
			window.showErrorMessage(createDirResult.error[0]);
			return;
		}

		const checksumDownloadResult = await downloadFluxChecksums(latestFluxVersionResult.result);
		if (failed(checksumDownloadResult)) {
			window.showErrorMessage(`Failed to download the checksums.txt file ${checksumDownloadResult.error[0]}`);
			return;
		}

		const readChecksumFileResult = await readFile(checksumDownloadResult.result);
		if (failed(readChecksumFileResult)) {
			window.showErrorMessage(`Error reading checksums.txt file ${readChecksumFileResult.error[0]}`);
			return;
		}

		const computeChecksumResult = await computeChecksumWindows(localArchiveFilePath, 'SHA256');
		if (failed(computeChecksumResult)) {
			window.showErrorMessage(`${computeChecksumResult.error[0]}`);
			return;
		}

		const checkChecksumResult = checkChecksum(readChecksumFileResult.result, gitHubAssetArchiveName, computeChecksumResult.result);
		if (failed(checkChecksumResult)) {
			window.showErrorMessage(checkChecksumResult.error[0]);
			return;
		}

		output.send('✔ Checksum matches', { newline: 'single' });

		const moveFileResult = await moveFile(executablePath, appDataFluxExecutablePath);
		if (failed(moveFileResult)) {
			window.showErrorMessage(moveFileResult.error[0]);
			return;
		}

		output.send(`✔ Flux executable path is: "${appDataFluxExecutablePath}"`, { newline: 'single' });

		const appendToPathResult = await appendToPathEnvironmentVariableWindows(path.join(appDataPathResult.result, 'flux'));
		if (failed(appendToPathResult)) {
			window.showErrorMessage(appendToPathResult.error[0]);
			return;
		}

		output.send('✔ Flux added to the PATH environment variable', { newline: 'single' });

		globalState.set(GlobalStateKey.FluxPath, path.join(appDataPathResult.result, 'flux'));

		deleteFile(localArchiveFilePath);
		deleteFile(path.join(os.tmpdir(), `flux_${latestFluxVersionResult.result}_checksums.txt`));

		output.send(`✔ Flux ${latestFluxVersionResult.result} successfully installed`);

		refreshAllTreeViewsCommand();
		showNotificationToReloadTheEditor();

		return;
	}

	// Linux/MacOS
	const installFileName = 'flux-install.sh';
	const tempDirPath = os.tmpdir();
	const tempFilePath = path.join(tempDirPath, installFileName);

	request(
		{
			url: 'https://fluxcd.io/install.sh',
			rejectUnauthorized: false,
		},
		(error: Error, response: any, body: string) => {
			if (!error && response.statusCode === 200) {
				fs.writeFile(tempFilePath, body, err => {
					if (err) {
						window.showErrorMessage(err.message);
						return;
					}
					// cannot use `shell.execWithOutput()` Script requires input from the user (password)
					runTerminalCommand(`bash "./${installFileName}"`, {
						cwd: tempDirPath,
						focusTerminal: true,
					});
				});
			} else {
				window.showErrorMessage(`Request failed ${error}`);
			}
		},
	);
}

async function showNotificationToReloadTheEditor() {
	const reloadEditorButton = 'Reload Editor';
	const pressedButton = await window.showInformationMessage('Flux successfully installed.', reloadEditorButton);
	if (pressedButton === reloadEditorButton) {
		commands.executeCommand('workbench.action.reloadWindow');
	}
}
