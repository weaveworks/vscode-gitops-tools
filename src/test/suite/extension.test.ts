import * as assert from 'assert';
import { after, before } from 'mocha';
import { ClusterDataProvider } from 'ui/treeviews/dataProviders/clusterDataProvider';
import { SourceDataProvider } from 'ui/treeviews/dataProviders/sourceDataProvider';
import { WorkloadDataProvider } from 'ui/treeviews/dataProviders/workloadDataProvider';
import { NamespaceNode } from 'ui/treeviews/nodes/namespaceNode';
import * as vscode from 'vscode';

let api: {
	shell: { execWithOutput: any; };
	data: {
		clusterTreeViewProvider: ClusterDataProvider;
		sourceTreeViewProvider: SourceDataProvider;
		workloadTreeViewProvider: WorkloadDataProvider;
	};
};

let currentContext: string;
let source;
let namespace;
let workload;

async function getTreeItem(treeDataProvider: WorkloadDataProvider | SourceDataProvider | ClusterDataProvider, label: string): Promise<vscode.TreeItem | undefined> {
	const childItems = await treeDataProvider.getChildren();
	return childItems.find(i => i.label === label);
}


function retry(fn: ()=> Promise<any>, retries = 3, err = null) {
	if (!retries) {
		return Promise.reject(err);
	}
	return fn().catch((erro): any => retry(fn, (retries - 1), erro));
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

	// Flux should be uninstalled after tests are done
	after(async function() {
		this.timeout(4000); // default 2000ms is too brief, sometimes takes longer
		let cluster = await getTreeItem(api.data.clusterTreeViewProvider, currentContext);
		await vscode.commands.executeCommand('gitops.flux.uninstall', cluster);
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

		retry(async function () {
			cluster = await getTreeItem(api.data.clusterTreeViewProvider, currentContext);
			assert.strictEqual((cluster as any).children.length, 4, 'Enabling GitOps should list installed Flux controllers');
		});
	});

	test('Sources are listed', async function() {
		this.timeout(15000);

		await api.shell.execWithOutput('flux create source git podinfo --url=https://github.com/stefanprodan/podinfo --branch master --namespace default');
		await vscode.commands.executeCommand('gitops.views.refreshResourcesTreeView');

		retry(async function () {

			namespace = await getTreeItem(api.data.sourceTreeViewProvider, 'default') as NamespaceNode;
			source = namespace && namespace.children[0];
			assert.strictEqual(source?.label, 'GitRepository: podinfo', 'Adding a GitSource and refreshing the view should list it');
		});

		await api.shell.execWithOutput('flux delete source git podinfo -s --namespace default');
		await vscode.commands.executeCommand('gitops.views.refreshAllTreeViews'); // refresh all'

		retry(async function () {

			namespace = await getTreeItem(api.data.sourceTreeViewProvider, 'default') as NamespaceNode;
			source = namespace && namespace.children[0];
			assert.strictEqual(source, undefined, 'Removing a GitSource and refreshing all views should unlist it');
		});
	});

	test('OCI Sources are listed', async function() {
		this.timeout(30000);

		await api.shell.execWithOutput('flux create source oci podinfo --url=oci://ghcr.io/stefanprodan/manifests/podinfo --tag-semver 6.1.x --namespace default');
		await vscode.commands.executeCommand('gitops.views.refreshResourcesTreeView');

		retry(async function () {
			namespace = await getTreeItem(api.data.sourceTreeViewProvider, 'default') as NamespaceNode;
			source = namespace && namespace.children[0];
			assert.strictEqual(source?.label, 'OCIRepository: podinfo', 'Adding a OCI Source and refreshing the view should list it');
		});

		await api.shell.execWithOutput('flux delete source oci podinfo -s --namespace default');
		await vscode.commands.executeCommand('gitops.views.refreshAllTreeViews'); // refresh all'

		retry(async function () {
			namespace = await getTreeItem(api.data.sourceTreeViewProvider, 'default') as NamespaceNode;
			source = namespace && namespace.children[0];
			assert.strictEqual(source, undefined, 'Removing an OCI Source and refreshing all views should unlist it');
		});
	});

	test('Kustomizations are listed', async function() {
		this.timeout(20000);

		await api.shell.execWithOutput('flux create kustomization podinfo --target-namespace=default --source=podinfo --path="./kustomize" --timeout=5s --namespace=default');
		await vscode.commands.executeCommand('gitops.views.refreshResourcesTreeView');

		retry(async function () {
			namespace = await getTreeItem(api.data.workloadTreeViewProvider, 'default') as NamespaceNode;
			workload = namespace && namespace.children[0];
			assert.strictEqual(workload?.label, 'Kustomization: podinfo', 'Adding a Kustomization and refreshing the view should list it');
		});
		await api.shell.execWithOutput('flux delete kustomization podinfo -s --namespace=default');
		await vscode.commands.executeCommand('gitops.views.refreshAllTreeViews'); // refresh all'

		retry(async function () {
			namespace = await getTreeItem(api.data.workloadTreeViewProvider, 'default') as NamespaceNode;
			workload = namespace && namespace.children[0];
			assert.strictEqual(workload, undefined, 'Removing a Kustomization and refreshing all views should unlist it');
		});
	});

	test('Disable GitOps uninstalls Flux',  async function () {
		this.timeout(60000);

		let cluster = await getTreeItem(api.data.clusterTreeViewProvider, currentContext);

		await vscode.commands.executeCommand('gitops.flux.uninstall', cluster);

		retry(async function () {
			cluster = await getTreeItem(api.data.clusterTreeViewProvider, currentContext);
			assert.strictEqual((cluster as any).children.length, 0, 'Disabling GitOps should list 0 installed Flux controllers');
		});
	});

});
