import * as assert from 'assert';
import { after, before } from 'mocha';
import { createCluster, setupGitServer, createEnvGitSource } from './e2eEnv';
import * as vscode from 'vscode';



suite('Extension Test Suite', () => {
	before(async function() {
		this.timeout(60000);

		await createCluster();

		const gitopsext = vscode.extensions.getExtension('weaveworks.vscode-gitops-tools');
		await gitopsext?.activate();
		const fluxPreOutput = await vscode.commands.executeCommand('gitops.flux.checkPrerequisites');
		if(fluxPreOutput === undefined) {
			await vscode.commands.executeCommand('gitops.installFluxCli');
		}

		await setupGitServer();
		await createEnvGitSource();
	});

	after(() => {
		vscode.window.showInformationMessage('All tests done!');
	});

	test('Extension is activated', () => {
		const gitopsext = vscode.extensions.getExtension('weaveworks.vscode-gitops-tools');

		assert.notStrictEqual(gitopsext, undefined);
		assert.strictEqual(gitopsext?.isActive, true);
	});

	test('Flux CLI is installed', async () => {
		const fluxPreOutput = await vscode.commands.executeCommand('gitops.flux.checkPrerequisites');
		assert.notStrictEqual(fluxPreOutput, undefined);
	});

	test('GitSource', async () => {
		// TODO: use flux CLI to confirm GitSource created with gitops.editor.createSource exists
	});
});
