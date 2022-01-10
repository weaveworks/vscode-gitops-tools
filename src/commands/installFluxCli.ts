import fs from 'fs';
import { IncomingMessage } from 'http';
import https from 'https';
import os from 'os';
import path from 'path';
import request from 'request';
import { commands, Uri, window } from 'vscode';
import { Platform, shell } from '../shell';
import { runTerminalCommand } from '../terminal';

const fluxGitHubUserProject = 'fluxcd/flux2';

/**
 * Get latest version tag from releases of the specified project.
 * @param gitHubUserProject user/project string e.g. `fluxcd/flux2`
 */
async function getLatestVersion(gitHubUserProject: string) {
	return new Promise(resolve => {
		https.get(`https://github.com/${gitHubUserProject}/releases/latest`, (res: IncomingMessage) => {

			const location = res.headers.location;
			if (!location) {
				window.showErrorMessage(`Failed to get latest ${gitHubUserProject} version: No location in response.`);
				return;
			}

			resolve(location.split('/').pop());

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
		// TODO: implement Flux CLI install on Windows OS
		// const latest = await getLatestVersion(fluxGitHubUserProject);
		commands.executeCommand('vscode.open', Uri.parse('https://fluxcd.io/docs/installation/'));
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
