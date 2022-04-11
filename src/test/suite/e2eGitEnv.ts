import { resolve } from 'path';
import * as vscode from 'vscode';


export async function setupGitServer(shell: { execWithOutput: any; }) {
	const workingDir = resolve('vscode-gitops-tools/test/');

	console.log('workingDir dir is', workingDir);

	const a = await shell.execWithOutput('flux check --pre');

	// shelljs.rm('-rf', workingDir);

	// TODO:
	// ssh-keygen
	// create git repo and --bare clone
	// docker run --name gitsrv jkarlos/git-server-docker
}
