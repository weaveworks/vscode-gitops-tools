import * as assert from 'assert';
import { after, before } from 'mocha';
import { setupGitServer } from './e2eGitEnv';
import * as vscode from 'vscode';

let api: { shell: { execWithOutput: any; }; };

suite('Extension Test Suite', () => {
	before(async function() {
		this.timeout(10000);

		const gitopsext = vscode.extensions.getExtension('weaveworks.vscode-gitops-tools');
		api = await gitopsext?.activate();

		const fluxPreOutput = await api.shell.execWithOutput('flux check --pre');
		assert.strictEqual(fluxPreOutput, undefined, 'Flux should not be installed (to test flux installation)');
	});

	after(() => {
		vscode.window.showInformationMessage('All tests done!');
	});

	test('Extension is activated', () => {
		const gitopsext = vscode.extensions.getExtension('weaveworks.vscode-gitops-tools');

		assert.notStrictEqual(gitopsext, undefined);
		assert.strictEqual(gitopsext?.isActive, true);
	});

	test('Flux CLI is installed', async function () {
		this.timeout(60000);

		await vscode.commands.executeCommand('gitops.installFluxCli');
		const fluxPreOutput = await api.shell.execWithOutput('flux check --pre');
		assert.notStrictEqual(fluxPreOutput, undefined);
	});

	test('Current cluster is listed',  async () => {
		// TODO: query the treeview to see the current cluster

	});

	test('GitSource', async function() {
		this.timeout(60000);

		await setupGitServer(api.shell);
		// TODO: create a GitRepository using 'gitops.editor.createSource'
		// TODO: use flux CLI to confirm GitSource created with gitops.editor.createSource exists
		// TODO: use treeview or other vscode API to confirm it is listed

	});
});
