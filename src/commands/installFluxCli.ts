import fs from 'fs';
import { IncomingMessage } from 'http';
import https from 'https';
import os from 'os';
import path from 'path';
import request from 'request';
import { commands, Uri, window } from 'vscode';
import { failed } from '../errorable';
import { Platform, shell } from '../shell';
import { runTerminalCommand } from '../terminal';
import { createDir, downloadFile, getAppdataPath, moveFile, unzipFile } from '../utils/fsUtils';

const fluxGitHubUserProject = 'fluxcd/flux2';

/**
 * Get latest version tag from releases of the specified project.
 *
 * @param gitHubUserProject user/project string e.g. `fluxcd/flux2`
 * @returns version string e.g. `0.24.1`
 */
async function getLatestVersion(gitHubUserProject: string): Promise<string | undefined> {
	return new Promise(resolve => {
		https.get(`https://github.com/${gitHubUserProject}/releases/latest`, (res: IncomingMessage) => {

			const location = res.headers.location;
			if (!location) {
				window.showErrorMessage(`Failed to get latest ${gitHubUserProject} version: No location in response.`);
				return;
			}

			resolve(location.split('/').pop()?.replace(/^v/, ''));

		}).on('error', err => {
			window.showErrorMessage(err.message);
		});
	});
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
		commands.executeCommand('vscode.open', Uri.parse('https://fluxcd.io/docs/installation/'));
		return;
		// const latestFluxVersion = await getLatestVersion(fluxGitHubUserProject);
		// const gitHubAssetName = `flux_${latestFluxVersion}_windows_${os.arch() === 'x64' ? 'amd64' : '386'}.zip`;
		// const downloadLink = `https://github.com/${fluxGitHubUserProject}/releases/latest/download/${gitHubAssetName}`;
		// const localZipFilePath = path.join(os.tmpdir(), gitHubAssetName);

		// const downloadResult = await downloadFile(downloadLink, localZipFilePath);
		// if (failed(downloadResult)) {
		// 	window.showErrorMessage(`File download failed: ${downloadResult.error[0]}`);
		// 	return;
		// }

		// // TODO: download hash, compare it to the file

		// const unzipResult = await unzipFile(localZipFilePath);
		// if (failed(unzipResult)) {
		// 	window.showErrorMessage(`File unzip failed: ${unzipResult.error[0]}`);
		// 	return;
		// }

		// const appDataPathResult = getAppdataPath();
		// if (failed(appDataPathResult)) {
		// 	window.showErrorMessage(appDataPathResult.error[0]);
		// 	return;
		// }

		// const executablePath = path.join(unzipResult.result, 'flux.exe');
		// const programFilesFluxExecutablePath = path.join(appDataPathResult.result, 'flux', 'flux.exe');

		// const createDirResult = await createDir(path.join(appDataPathResult.result, 'flux'));
		// if (failed(createDirResult)) {
		// 	window.showErrorMessage(createDirResult.error[0]);
		// 	return;
		// }

		// const moveFileResult = await moveFile(executablePath, programFilesFluxExecutablePath);
		// if (failed(moveFileResult)) {
		// 	window.showErrorMessage(moveFileResult.error[0]);
		// 	return;
		// }

		// // TODO: delete temp files
		// // TODO: add executable to the PATH

		// return;
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
