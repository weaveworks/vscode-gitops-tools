import { TreeItem, TreeView, window } from 'vscode';
import { ApplicationDataProvider } from './dataProviders/applicationDataProvider';
import { ClusterDataProvider } from './dataProviders/clusterDataProvider';
import { DocumentationDataProvider } from './dataProviders/documentationDataProvider';
import { SourceDataProvider } from './dataProviders/sourceDataProvider';
import { TreeNode } from './nodes/treeNode';
import { Views } from './views';

let clusterTreeViewProvider: ClusterDataProvider;
let sourceTreeViewProvider: SourceDataProvider;
let applicationTreeViewProvider: ApplicationDataProvider;
let documentationTreeViewProvider: DocumentationDataProvider;

let clusterTreeView: TreeView<TreeItem>;
let sourceTreeView: TreeView<TreeItem>;
let applicationTreeView: TreeView<TreeItem>;
let documentationTreeView: TreeView<TreeItem>;

/**
 * Creates tree views for the GitOps sidebar.
 */
export function createTreeViews() {
	// create gitops tree view data providers
	clusterTreeViewProvider = new ClusterDataProvider();
	sourceTreeViewProvider =  new SourceDataProvider();
	applicationTreeViewProvider = new ApplicationDataProvider();
	documentationTreeViewProvider = new DocumentationDataProvider();

	// create gitops sidebar tree views
	clusterTreeView = window.createTreeView(Views.ClusterView, {
		treeDataProvider: clusterTreeViewProvider,
		showCollapseAll: true,
	});

	sourceTreeView = window.createTreeView(Views.SourceView, {
		treeDataProvider: sourceTreeViewProvider,
		showCollapseAll: true,
	});

	applicationTreeView = window.createTreeView(Views.ApplicationView, {
		treeDataProvider: applicationTreeViewProvider,
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
	refreshApplicationTreeView();
}

/**
 * Reloads configured clusters tree view via kubectl.
 * When an argument is passed - only that tree item
 * and its children are updated.
 */
export function refreshClusterTreeView(node?: TreeNode) {
	clusterTreeViewProvider.refresh(node);
}

/**
 * Reloads sources tree view for the selected cluster.
 */
export function refreshSourceTreeView(node?: TreeNode) {
	sourceTreeViewProvider.refresh(node);
}

/**
 * Reloads applications tree view for the selected cluster.
 */
export function refreshApplicationTreeView(node?: TreeNode) {
	applicationTreeViewProvider.refresh(node);
}

/**
 * @see {@link clusterTreeViewProvider.getCurrentClusterNode}
 */
export function getCurrentClusterNode() {
	return clusterTreeViewProvider.getCurrentClusterNode();
}
