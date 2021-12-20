import { TreeItem, TreeView, window } from 'vscode';
import { WorkloadDataProvider } from './dataProviders/workloadDataProvider';
import { ClusterDataProvider } from './dataProviders/clusterDataProvider';
import { DocumentationDataProvider } from './dataProviders/documentationDataProvider';
import { SourceDataProvider } from './dataProviders/sourceDataProvider';
import { ClusterContextNode } from './nodes/clusterContextNode';
import { TreeNode } from './nodes/treeNode';
import { Views } from './views';

let clusterTreeViewProvider: ClusterDataProvider;
let sourceTreeViewProvider: SourceDataProvider;
let workloadTreeViewProvider: WorkloadDataProvider;
let documentationTreeViewProvider: DocumentationDataProvider;

let clusterTreeView: TreeView<TreeItem>;
let sourceTreeView: TreeView<TreeItem>;
let workloadTreeView: TreeView<TreeItem>;
let documentationTreeView: TreeView<TreeItem>;

/**
 * Creates tree views for the GitOps sidebar.
 */
export function createTreeViews() {
	// create gitops tree view data providers
	clusterTreeViewProvider = new ClusterDataProvider();
	sourceTreeViewProvider =  new SourceDataProvider();
	workloadTreeViewProvider = new WorkloadDataProvider();
	documentationTreeViewProvider = new DocumentationDataProvider();

	// create gitops sidebar tree views
	clusterTreeView = window.createTreeView(Views.ClustersView, {
		treeDataProvider: clusterTreeViewProvider,
		showCollapseAll: true,
	});

	sourceTreeView = window.createTreeView(Views.SourcesView, {
		treeDataProvider: sourceTreeViewProvider,
		showCollapseAll: true,
	});

	workloadTreeView = window.createTreeView(Views.WorkloadsView, {
		treeDataProvider: workloadTreeViewProvider,
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
export function refreshAllTreeViews() {
	refreshClustersTreeView();
	refreshSourcesTreeView();
	refreshWorkloadsTreeView();
}

/**
 * Reloads configured clusters tree view via kubectl.
 * When an argument is passed - only that tree item
 * and its children are updated.
 */
export function refreshClustersTreeView(node?: TreeNode) {
	clusterTreeViewProvider.refresh(node);
}

/**
 * Reloads sources tree view for the selected cluster.
 */
export function refreshSourcesTreeView(node?: TreeNode) {
	sourceTreeViewProvider.refresh(node);
}

/**
 * Reloads workloads tree view for the selected cluster.
 */
export function refreshWorkloadsTreeView(node?: TreeNode) {
	workloadTreeViewProvider.refresh(node);
}

/**
 * @see {@link clusterTreeViewProvider.getCurrentClusterNode}
 */
export function getCurrentClusterNode() {
	return clusterTreeViewProvider.getCurrentClusterNode();
}

/**
 * Expand, focus or select a tree node inside the Clusters tree view.
 * @param clusterNode Target cluster node
 */
export async function revealClusterNode(clusterNode: ClusterContextNode, {
	expand = false,
	focus = false,
	select = false,
}: {
	expand?: boolean;
	focus?: boolean;
	select?: boolean;
} | undefined = {}) {
	return await clusterTreeView.reveal(clusterNode, {
		expand,
		focus,
		select,
	});
}
