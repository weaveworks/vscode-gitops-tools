import { TreeItem, TreeView, window } from 'vscode';

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
import { kubeConfig, onCurrentContextChanged, onKubeConfigContextsChanged } from 'cli/kubernetes/kubernetesConfig';
import { ClusterInfo } from 'types/kubernetes/clusterProvider';
import { TemplateDataProvider } from './dataProviders/templateDataProvider';
import { loadAvailableResourceKinds } from 'cli/kubernetes/kubectlGet';

export let clusterDataProvider: ClusterDataProvider;
export let sourceDataProvider: SourceDataProvider;
export let workloadDataProvider: WorkloadDataProvider;
export let documentationDataProvider: DocumentationDataProvider;
export let templateDateProvider: TemplateDataProvider;

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
	clusterDataProvider = new ClusterDataProvider();
	sourceDataProvider =  new SourceDataProvider();
	workloadDataProvider = new WorkloadDataProvider();
	documentationDataProvider = new DocumentationDataProvider();
	templateDateProvider = new TemplateDataProvider();

	// schedule tree view initialiation for next phase of event loop
	// when informers should be ready to avoid slower kubectl fallback
	setTimeout(() => {
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


		// WGE templates
		templateTreeView = window.createTreeView(TreeViewId.TemplatesView, {
			treeDataProvider: templateDateProvider,
			showCollapseAll: true,
		});

		// create documentation links sidebar tree view
		documentationTreeView = window.createTreeView(TreeViewId.DocumentationView, {
			treeDataProvider: documentationDataProvider,
			showCollapseAll: true,
		});

		listenRefreshEvents();
	}, 100);

}

async function listenRefreshEvents() {
	onKubeConfigContextsChanged.event(() => {
		refreshClustersTreeView();
	});

	onCurrentContextChanged.event(() => {
		refreshResourcesTreeViews();
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
	if (node && !clusterDataProvider.includesTreeNode(node)) {
		// Trying to refresh old (non-existent) cluster context node
		return;
	}
	clusterDataProvider.refresh(node);
}

/**
 * Reloads sources tree view for the selected cluster.
 */
export function refreshSourcesTreeView(node?: TreeNode) {
	sourceDataProvider.refresh(node);
}

/**
 * Reloads workloads tree view for the selected cluster.
 */
export function refreshWorkloadsTreeView(node?: TreeNode) {
	workloadDataProvider.refresh(node);
}

/**
 * Reloads workloads tree view for the selected cluster.
 */
export function refreshTemplatesTreeView(node?: TreeNode) {
	templateDateProvider.refresh(node);
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
