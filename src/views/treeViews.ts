import {
	ExtensionContext,
	TreeItem,
	TreeView,
	window
} from 'vscode';
import { ClusterTreeViewDataProvider } from './clusterTreeViewDataProvider';
import { DeploymentTreeViewDataProvider } from './deploymentTreeViewDataProvider';
import { DocumentationTreeViewDataProvider } from './documentationTreeViewDataProvider';
import { SourceTreeViewDataProvider } from './sourceTreeViewDataProvider';
import { Views } from './views';

let clusterTreeViewProvider: ClusterTreeViewDataProvider;
let sourceTreeViewProvider: SourceTreeViewDataProvider;
let deploymentTreeViewProvider: DeploymentTreeViewDataProvider;
let documentationTreeViewProvider: DocumentationTreeViewDataProvider;

let clusterTreeView: TreeView<TreeItem>;
let sourceTreeView: TreeView<TreeItem>;
let deploymentTreeView: TreeView<TreeItem>;
let documentationTreeView: TreeView<TreeItem>;

/**
 * Creates tree views for the GitOps sidebar.
 * @param extensionContext VSCode extension context.
 */
export function createTreeViews(extensionContext: ExtensionContext) {
	// create gitops tree view data providers
	clusterTreeViewProvider = new ClusterTreeViewDataProvider(extensionContext);
	sourceTreeViewProvider =  new SourceTreeViewDataProvider(extensionContext);
	deploymentTreeViewProvider = new DeploymentTreeViewDataProvider(extensionContext);
	documentationTreeViewProvider = new DocumentationTreeViewDataProvider();

	// create gitops sidebar tree views
  clusterTreeView = window.createTreeView(Views.ClusterView, {
    treeDataProvider: clusterTreeViewProvider,
    showCollapseAll: true,
  });

	sourceTreeView = window.createTreeView(Views.SourceView, {
    treeDataProvider: sourceTreeViewProvider,
    showCollapseAll: true,
  });

	deploymentTreeView = window.createTreeView(Views.DeploymentView, {
    treeDataProvider: deploymentTreeViewProvider,
    showCollapseAll: true,
  });

	// create documentation links sidebar tree view
	documentationTreeView = window.createTreeView(Views.DocumentationView, {
		treeDataProvider: documentationTreeViewProvider,
		showCollapseAll: true,
	});
}

/**
 * Refreshes all GitOps tree views.
 */
 export function refreshTreeViews() {
	refreshClusterTreeView();
	refreshSourceTreeView();
	refreshDeploymentTreeView();
}

/**
 * Reloads configured clusters tree view via kubectl.
 */
export function refreshClusterTreeView() {
	clusterTreeViewProvider.refresh();
}

/**
 * Reloads sources tree view for the selected cluster.
 */
export function refreshSourceTreeView() {
	sourceTreeViewProvider.refresh();
}

/**
 * Reloads deployments tree view for the selected cluster.
 */
export function refreshDeploymentTreeView() {
	deploymentTreeViewProvider.refresh();
}
