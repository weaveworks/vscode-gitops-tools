import * as assert from 'assert';
import { before } from 'mocha';
import * as vscode from 'vscode';
import { DataProvider } from '../../views/dataProviders/dataProvider';
import { ClusterDataProvider } from '../../views/dataProviders/clusterDataProvider';
import { SourceDataProvider } from '../../views/dataProviders/sourceDataProvider';
import { WorkloadDataProvider } from '../../views/dataProviders/workloadDataProvider';

let api: {
	shell: { execWithOutput: any; };
	data: {
		clusterTreeViewProvider: ClusterDataProvider;
		sourceTreeViewProvider: SourceDataProvider;
		workloadTreeViewProvider: WorkloadDataProvider;
	};
};

let currentContext: string;

async function getTreeItem(treeDataProvider: DataProvider, label: string): Promise<vscode.TreeItem | undefined> {
	const childItems = await treeDataProvider.getChildren();
	return childItems.find(i => i.label === label);
}

async function installKubernetesToolsDependency() {
	const name = 'ms-kubernetes-tools.vscode-kubernetes-tools';
	let extension = vscode.extensions.getExtension(name);

	if(!extension) {
		await vscode.commands.executeCommand('workbench.extensions.installExtension', name); // install the extension.
		await vscode.commands.executeCommand('workbench.action.reloadWindow');
	}

	extension = vscode.extensions.getExtension(name);
	extension?.activate();
}

suite('Extension Test Suite', () => {
	before(async function() {
		this.timeout(80000);

		await installKubernetesToolsDependency();

		const gitopsext = vscode.extensions.getExtension('weaveworks.vscode-gitops-tools');
		api = await gitopsext?.activate();

		const contextOutput = await api.shell.execWithOutput('kubectl config current-context');
		assert.strictEqual(contextOutput.code, 0, 'kubectl must be installed and current context set');

		currentContext = contextOutput.stdout.slice(0, -1);

		const fluxPreOutput = await api.shell.execWithOutput('flux check --pre');
		assert.strictEqual(fluxPreOutput.code, 0, 'Flux CLI should be installed');

		const fluxNamespaceOutput = await api.shell.execWithOutput('kubectl get namespace flux-system');
		assert.notStrictEqual(fluxNamespaceOutput.code, 0, 'Flux must not be installed - the namespace flux-system should not exist');
	});

	test('Extension is activated', async () => {
		const gitopsext = vscode.extensions.getExtension('weaveworks.vscode-gitops-tools');

		assert.notStrictEqual(gitopsext, undefined);
		assert.strictEqual(gitopsext?.isActive, true);
	});

	test('Current cluster is listed',  async function()  {
		this.timeout(10000);

		const cluster = await getTreeItem(api.data.clusterTreeViewProvider, currentContext);
		assert.strictEqual(cluster?.label, currentContext, `Clusters treeview must include the current context ${currentContext}`);
	});

	test('Enable GitOps installs Flux',  async function () {
		this.timeout(180000);

		let cluster = await getTreeItem(api.data.clusterTreeViewProvider, currentContext);

		await vscode.commands.executeCommand('gitops.flux.install', cluster);

		cluster = await getTreeItem(api.data.clusterTreeViewProvider, currentContext);
		assert.strictEqual((cluster as any).children.length, 4, 'Enabling GitOps should list installed Flux controllers');
	});

	test('Sources are listed', async function() {
		this.timeout(15000);

		await api.shell.execWithOutput('flux create source git podinfo --url=https://github.com/stefanprodan/podinfo --branch master');
		await vscode.commands.executeCommand('gitops.views.refreshResourcesTreeView');

		let source = await getTreeItem(api.data.sourceTreeViewProvider, 'GitRepository: podinfo');
		assert.notStrictEqual(source, undefined, 'Adding a GitSource and refreshing the view should list it');

		await api.shell.execWithOutput('flux delete source git podinfo -s');
		await vscode.commands.executeCommand('gitops.views.refreshAllTreeViews'); // refresh all'

		source = await getTreeItem(api.data.sourceTreeViewProvider, 'GitRepository: podinfo');
		assert.strictEqual(source, undefined, 'Removing a GitSource and refreshing all views should unlist it');
	});

	test('OCI Sources are listed', async function() {
		this.timeout(15000);

		await api.shell.execWithOutput('flux create source oci podinfo --url=oci://ghcr.io/stefanprodan/manifests/podinfo --tag-semver 6.1.x');
		await vscode.commands.executeCommand('gitops.views.refreshResourcesTreeView');

		let source = await getTreeItem(api.data.sourceTreeViewProvider, 'OCIRepository: podinfo');
		assert.notStrictEqual(source, undefined, 'Adding a OCI Source and refreshing the view should list it');

		await api.shell.execWithOutput('flux delete source oci podinfo -s');
		await vscode.commands.executeCommand('gitops.views.refreshAllTreeViews'); // refresh all'

		source = await getTreeItem(api.data.sourceTreeViewProvider, 'OCIRepository: podinfo');
		assert.strictEqual(source, undefined, 'Removing an OCI Source and refreshing all views should unlist it');
	});

	test('Kustomizations are listed', async function() {
		this.timeout(10000);

		await api.shell.execWithOutput('flux create kustomization podinfo --target-namespace=default --source=podinfo --path="./kustomize" --timeout=5s');
		await vscode.commands.executeCommand('gitops.views.refreshResourcesTreeView');

		let workload = await getTreeItem(api.data.workloadTreeViewProvider, 'podinfo');
		assert.notStrictEqual(workload, undefined, 'Adding a Kustomization and refreshing the view should list it');

		await api.shell.execWithOutput('flux delete kustomization podinfo -s');
		await vscode.commands.executeCommand('gitops.views.refreshAllTreeViews'); // refresh all'

		workload = await getTreeItem(api.data.workloadTreeViewProvider, 'podinfo');
		assert.strictEqual(workload, undefined, 'Removing a Kustomization and refreshing all views should unlist it');
	});

	test('Disable GitOps uninstalls Flux',  async function () {
		this.timeout(60000);

		let cluster = await getTreeItem(api.data.clusterTreeViewProvider, currentContext);

		await vscode.commands.executeCommand('gitops.flux.uninstall', cluster);

		cluster = await getTreeItem(api.data.clusterTreeViewProvider, currentContext);
		assert.strictEqual((cluster as any).children.length, 0, 'Enabling GitOps should list installed Flux controllers');
	});

});
