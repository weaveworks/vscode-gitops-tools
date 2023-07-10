import { TreeItem, TreeView, window } from 'vscode';
import * as k8s from 'vscode-kubernetes-tools-api';

import { isAzureProvider } from 'cli/azure/azureTools';
import { globalState } from 'extension';
import { Errorable, failed } from 'types/errorable';
import { TreeViewId } from 'types/extensionIds';
import { ClusterDataProvider } from './dataProviders/clusterDataProvider';
import { DocumentationDataProvider } from './dataProviders/documentationDataProvider';
import { SourceDataProvider } from './dataProviders/sourceDataProvider';
import { WorkloadDataProvider } from './dataProviders/workloadDataProvider';
import { ClusterNode } from './nodes/cluster/clusterNode';
import { TreeNode } from './nodes/treeNode';

import { detectClusterProvider } from 'cli/kubernetes/clusterProvider';
import { getClusterName, getCurrentContextName } from 'cli/kubernetes/kubernetesConfig';
import { ClusterInfo } from 'types/kubernetes/clusterProvider';
import { TemplateDataProvider } from './dataProviders/templateDataProvider';

export let clusterTreeViewProvider: ClusterDataProvider;
export let sourceTreeViewProvider: SourceDataProvider;
export let workloadTreeViewProvider: WorkloadDataProvider;
export let documentationTreeViewProvider: DocumentationDataProvider;
export let templateTreeViewProvider: TemplateDataProvider;

let clusterTreeView: TreeView<TreeItem>;
let sourceTreeView: TreeView<TreeItem>;
let workloadTreeView: TreeView<TreeItem>;
let documentationTreeView: TreeView<TreeItem>;
let templateTreeView: TreeView<TreeItem>;

/**
 * Creates tree views for the GitOps sidebar.
 */
export function createTreeViews() {
	// create gitops tree view data providers
	clusterTreeViewProvider = new ClusterDataProvider();
	sourceTreeViewProvider =  new SourceDataProvider();
	workloadTreeViewProvider = new WorkloadDataProvider();
	documentationTreeViewProvider = new DocumentationDataProvider();
	templateTreeViewProvider = new TemplateDataProvider();

	// create gitops sidebar tree views
	clusterTreeView = window.createTreeView(TreeViewId.ClustersView, {
		treeDataProvider: clusterTreeViewProvider,
		showCollapseAll: true,
	});

	sourceTreeView = window.createTreeView(TreeViewId.SourcesView, {
		treeDataProvider: sourceTreeViewProvider,
		showCollapseAll: true,
	});

	workloadTreeView = window.createTreeView(TreeViewId.WorkloadsView, {
		treeDataProvider: workloadTreeViewProvider,
		showCollapseAll: true,
	});


	// WGE templates
	templateTreeView = window.createTreeView(TreeViewId.TemplatesView, {
		treeDataProvider: templateTreeViewProvider,
		showCollapseAll: true,
	});

	// create documentation links sidebar tree view
	documentationTreeView = window.createTreeView(TreeViewId.DocumentationView, {
		treeDataProvider: documentationTreeViewProvider,
		showCollapseAll: true,
	});

	refreshWhenK8sContextChange();
	detectK8sConfigPathChange();
}

async function refreshWhenK8sContextChange() {
	const configuration = await k8s.extension.configuration.v1_1;
	if (!configuration.available) {
		return;
	}
	configuration.api.onDidChangeContext(_context => {
		refreshAllTreeViews();
	});
}
async function detectK8sConfigPathChange() {
	const configuration = await k8s.extension.configuration.v1_1;
	if (!configuration.available) {
		return;
	}
	configuration.api.onDidChangeKubeconfigPath(_path => {
		refreshAllTreeViews();
	});
}

/**
 * Refreshes all GitOps tree views.
 */
export function refreshAllTreeViews() {
	refreshClustersTreeView();
	refreshResourcesTreeViews();
}

export function refreshResourcesTreeViews() {
	refreshSourcesTreeView();
	refreshWorkloadsTreeView();
	refreshTemplatesTreeView();
}


/**
 * Reloads configured clusters tree view via kubectl.
 * When an argument is passed - only that tree item
 * and its children are updated.
 */
export function refreshClustersTreeView(node?: TreeNode) {
	if (node && !clusterTreeViewProvider.includesTreeNode(node)) {
		// Trying to refresh old (non-existent) cluster context node
		return;
	}
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
 * Reloads workloads tree view for the selected cluster.
 */
export function refreshTemplatesTreeView(node?: TreeNode) {
	templateTreeViewProvider.refresh(node);
}

/**
 * Get info about current cluster/context:
 * 1. Cluster name
 * 2. Context name
 * 3. Detect cluster provider.
 */
export async function getCurrentClusterInfo(): Promise<Errorable<ClusterInfo>> {
	const currentContextResult = await getCurrentContextName();

	if (failed(currentContextResult)) {
		const error = `Failed to get current context ${currentContextResult.error[0]}`;
		window.showErrorMessage(error);
		return {
			succeeded: false,
			error: [error],
		};
	}
	const currentContextName = currentContextResult.result;


	let currentClusterName = await getClusterName(currentContextName);

	// Pick user cluster provider override if defined
	const clusterMetadata = globalState.getClusterMetadata(currentClusterName);
	const isClusterProviderUserOverride = Boolean(clusterMetadata?.clusterProvider);
	const currentClusterProvider = clusterMetadata?.clusterProvider || await detectClusterProvider(currentContextName);

	return {
		succeeded: true,
		result: {
			clusterName: currentClusterName,
			contextName: currentContextName,
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
