import { resolve } from 'path';
import * as shelljs from 'shelljs';



export const namespace = 'vscode-gitops-tools-test';

export async function createCluster() {
	// TODO: install kind if needed
}

export async function setupGitServer() {
	const workingDir = resolve('vscode-gitops-tools/test/');

	console.log('workingDir dir is', workingDir);

	// shelljs.rm('-rf', workingDir);

	// TODO:
	// ssh-keygen
	// create git repo and --bare clone
	// docker run --name gitsrv jkarlos/git-server-docker
}

export async function createEnvGitSource() {
	// TODO: create a GitRepository using 'gitops.editor.createSource'
}
