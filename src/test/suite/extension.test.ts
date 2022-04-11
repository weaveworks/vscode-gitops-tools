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
		// assert.strictEqual(fluxPreOutput, undefined, 'Flux CLI should not be installed (to test Flux CLI installation)');
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

	test('Flux is installed',  async function () {
		this.timeout(20000);

		// Right clicking cluster 'Enable Gitops'
		// TODO: gitops.flux.install
		// flux check lists controllers
		// treeview lists controllers
	});

	test('GitSource is added and listed', async function() {
		this.timeout(60000);

		await setupGitServer(api.shell);
		// TODO: create a GitRepository using 'gitops.editor.createSource'
		// TODO: use flux CLI to confirm GitSource created with gitops.editor.createSource exists
		// TODO: use treeview or other vscode API to confirm it is listed

	});

	test('Flux is uninstalled installed',  async function () {
		this.timeout(20000);

		// Right clicking cluster 'Disable Gitops'
		// Enable 'GitOps' is listed
		// flux check is blank
		// no controller in the treeview
	});


});
