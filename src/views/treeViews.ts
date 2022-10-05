import { TreeItem, TreeView, window } from 'vscode';
import { isAzureProvider } from '../azure/azureTools';
import { Errorable, failed } from '../errorable';
import { globalState } from '../extension';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { ClusterProvider } from '../kubernetes/kubernetesTypes';
import { ClusterDataProvider } from './dataProviders/clusterDataProvider';
import { DocumentationDataProvider } from './dataProviders/documentationDataProvider';
import { SourceDataProvider } from './dataProviders/sourceDataProvider';
import { WorkloadDataProvider } from './dataProviders/workloadDataProvider';
import { ClusterContextNode } from './nodes/clusterContextNode';
import { TreeNode } from './nodes/treeNode';
import { Views } from './views';

import * as k8s from 'vscode-kubernetes-tools-api';

export let clusterTreeViewProvider: ClusterDataProvider;
export let sourceTreeViewProvider: SourceDataProvider;
export let workloadTreeViewProvider: WorkloadDataProvider;
export let documentationTreeViewProvider: DocumentationDataProvider;

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
	refreshSourcesTreeView();
	refreshWorkloadsTreeView();
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

export interface ClusterInfo {
	contextName: string;
	clusterName: string;
	clusterProvider: ClusterProvider;
	isClusterProviderUserOverride: boolean;
	isAzure: boolean;
}

/**
 * Get info about current cluster/context:
 * 1. Cluster name
 * 2. Context name
 * 3. Detect cluster provider.
 */
export async function getCurrentClusterInfo(): Promise<Errorable<ClusterInfo>> {
	const currentContextResult = await kubernetesTools.getCurrentContext();

	if (failed(currentContextResult)) {
		const error = `Failed to get current context ${currentContextResult.error[0]}`;
		window.showErrorMessage(error);
		return {
			succeeded: false,
			error: [error],
		};
	}
	const currentContextName = currentContextResult.result;


	let currentClusterName = await kubernetesTools.getClusterName(currentContextName);

	// Pick user cluster provider override if defined
	const clusterMetadata = globalState.getClusterMetadata(currentClusterName);
	const isClusterProviderUserOverride = Boolean(clusterMetadata?.clusterProvider);
	const currentClusterProvider = clusterMetadata?.clusterProvider || await kubernetesTools.detectClusterProvider(currentContextName);

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
