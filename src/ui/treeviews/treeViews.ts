import { TreeItem, TreeItemCollapsibleState, TreeView, window } from 'vscode';

import { isAzureProvider } from 'cli/azure/azureTools';
import { globalState } from 'extension';
import { Errorable } from 'types/errorable';
import { TreeViewId } from 'types/extensionIds';
import { ClusterDataProvider } from './dataProviders/clusterDataProvider';
import { DocumentationDataProvider } from './dataProviders/documentationDataProvider';
import { SourceDataProvider } from './dataProviders/sourceDataProvider';
import { WorkloadDataProvider } from './dataProviders/workloadDataProvider';
import { ClusterNode } from './nodes/cluster/clusterNode';

import { detectClusterProvider } from 'cli/kubernetes/clusterProvider';
import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { ClusterInfo } from 'types/kubernetes/clusterProvider';
import { WgeDataProvider } from './dataProviders/wgeDataProvider';
import { NamespaceNode } from './nodes/namespaceNode';
import { WgeContainerNode } from './nodes/wge/wgeNodes';

export let clusterDataProvider = new ClusterDataProvider();
export let sourceDataProvider = new SourceDataProvider();
export let workloadDataProvider = new WorkloadDataProvider();
export let documentationDataProvider = new DocumentationDataProvider();
export let wgeDataProvider = new WgeDataProvider();

let clusterTreeView: TreeView<TreeItem>;
export let sourceTreeView: TreeView<TreeItem>;
let workloadTreeView: TreeView<TreeItem>;
let documentationTreeView: TreeView<TreeItem>;
let wgeTreeView: TreeView<TreeItem>;

/**
 * Creates tree views for the GitOps sidebar.
 */
export function createTreeViews() {
	// create gitops sidebar tree views
	clusterTreeView = window.createTreeView(TreeViewId.ClustersView, {
		treeDataProvider: clusterDataProvider,
		showCollapseAll: true,
	});

	sourceTreeView = window.createTreeView(TreeViewId.SourcesView, {
		treeDataProvider: sourceDataProvider,
		showCollapseAll: true,
	});

	workloadTreeView = window.createTreeView(TreeViewId.WorkloadsView, {
		treeDataProvider: workloadDataProvider,
		showCollapseAll: true,
	});

	// WGE
	wgeTreeView = window.createTreeView(TreeViewId.WgeView, {
		treeDataProvider: wgeDataProvider,
		showCollapseAll: true,
	});

	listenCollapsableState();

	// create documentation links sidebar tree view
	documentationTreeView = window.createTreeView(TreeViewId.DocumentationView, {
		treeDataProvider: documentationDataProvider,
		showCollapseAll: true,
	});

	documentationDataProvider.reload();
}

function listenCollapsableState() {

	// [workloadTreeView, sourceTreeView, wgeTreeView].forEach(treeview => {
	// 	treeview.onDidCollapseElement(e => {
	// 		if (e.element instanceof NamespaceNode) {
	// 			e.element.collapsibleState = TreeItemCollapsibleState.Collapsed;
	// 			const provider = e.element.dataProvider;
	// 			// top-level namespace nodes should get an icon
	// 			const showIcons = provider.nodes.includes(e.element);
	// 			e.element.updateLabel(showIcons);
	// 			provider.redraw(e.element);
	// 		}
	// 	});

	// 	treeview.onDidExpandElement(e => {
	// 		if (e.element instanceof NamespaceNode) {
	// 			e.element.collapsibleState = TreeItemCollapsibleState.Expanded;
	// 			const provider = e.element.dataProvider;
	// 			// top-level namespace nodes should get an icon
	// 			const showIcons = provider.nodes.includes(e.element);
	// 			e.element.updateLabel(showIcons);
	// 			provider.redraw(e.element);
	// 		}
	// 	});
	// });
	sourceTreeView.onDidCollapseElement(e => {
		if (e.element instanceof NamespaceNode) {
			e.element.collapsibleState = TreeItemCollapsibleState.Collapsed;
			e.element.updateLabel();
			sourceDataProvider.redraw(e.element);
		}
	});

	sourceTreeView.onDidExpandElement(e => {
		if (e.element instanceof NamespaceNode) {
			e.element.collapsibleState = TreeItemCollapsibleState.Expanded;
			e.element.updateLabel();
			sourceDataProvider.redraw(e.element);
		}
	});

	workloadTreeView.onDidCollapseElement(e => {
		if (e.element instanceof NamespaceNode) {
			e.element.collapsibleState = TreeItemCollapsibleState.Collapsed;
			// top-level namespace nodes should get an icon
			const showIcons = workloadDataProvider.nodes.includes(e.element);
			e.element.updateLabel(showIcons);
			workloadDataProvider.redraw(e.element);
		}
	});

	workloadTreeView.onDidExpandElement(e => {
		if (e.element instanceof NamespaceNode) {
			e.element.collapsibleState = TreeItemCollapsibleState.Expanded;
			// top-level namespace nodes should get an icon
			const showIcons = workloadDataProvider.nodes.includes(e.element);
			e.element.updateLabel(showIcons);
			workloadDataProvider.redraw(e.element);
		}
	});


	wgeTreeView.onDidCollapseElement(e => {
		if (e.element instanceof NamespaceNode) {
			e.element.collapsibleState = TreeItemCollapsibleState.Collapsed;
			// top-level namespace nodes should get an icon
			const showIcons = e.element.parent instanceof WgeContainerNode;
			e.element.updateLabel(showIcons);
			wgeDataProvider.redraw(e.element);
		}
	});

	wgeTreeView.onDidExpandElement(e => {
		if (e.element instanceof NamespaceNode) {
			e.element.collapsibleState = TreeItemCollapsibleState.Expanded;
			// top-level namespace nodes should get an icon
			const showIcons = e.element.parent instanceof WgeContainerNode;
			e.element.updateLabel(showIcons);
			wgeDataProvider.redraw(e.element);
		}
	});
}

/**
 * Reloads configured clusters tree view via kubectl.
 * When an argument is passed - only that tree item
 * and its children are updated.
 */
export function reloadClustersTreeView() {
	clusterDataProvider.reload();
}

/**
 * Reloads sources tree view for the selected cluster.
 */
export function reloadSourcesTreeView() {
	sourceDataProvider.reload();
}

/**
 * Reloads workloads tree view for the selected cluster.
 */
export function reloadWorkloadsTreeView() {
	workloadDataProvider.reload();
}

/**
 * Reloads workloads tree view for the selected cluster.
 */
export function reloadWgeTreeView() {
	wgeDataProvider.reload();
}

/**
 * Get info about current cluster/context:
 * 1. Cluster name
 * 2. Context name
 * 3. Detect cluster provider.
 */
export async function getCurrentClusterInfo(): Promise<Errorable<ClusterInfo>> {
	const currentContextName = kubeConfig.getCurrentContext();

	if (!currentContextName) {
		const error = `Failed to get current context ${currentContextName}`;
		window.showErrorMessage(error);
		return {
			succeeded: false,
			error: [error],
		};
	}


	let currentClusterName = kubeConfig.getCurrentCluster()?.name;

	// Pick user cluster provider override if defined
	const clusterMetadata = globalState.getClusterMetadata(currentClusterName || currentContextName);
	const isClusterProviderUserOverride = Boolean(clusterMetadata?.clusterProvider);
	const currentClusterProvider = clusterMetadata?.clusterProvider || await detectClusterProvider(currentContextName);

	return {
		succeeded: true,
		result: {
			clusterProvider: currentClusterProvider,
			isClusterProviderUserOverride,
			isAzure: isAzureProvider(currentClusterProvider),
		},
	};
}

/**
 * Expand, focus or select a tree node inside the Clusters tree view.
 * @param clusterNode Target cluster node
 */
export async function revealClusterNode(clusterNode: ClusterNode, {
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
