import { loadKubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { refreshClustersTreeView, refreshSourcesTreeView, refreshTemplatesTreeView, refreshWorkloadsTreeView } from '../ui/treeviews/treeViews';

/**
 * Clicked button on the cluster tree view
 */

export async function refreshAllTreeViewsCommand() {
	await loadKubeConfig(true);
	refreshClustersTreeView();
	refreshResourcesTreeViews();
}

export async function refreshAllTreeViews() {
	refreshClustersTreeView();
	refreshResourcesTreeViews();
}


/**
 * Clicked button on the sources or workloads tree view
 */
export function refreshResourcesTreeViewsCommand() {
	refreshResourcesTreeViews();
}

export function refreshResourcesTreeViews() {
	refreshSourcesTreeView();
	refreshWorkloadsTreeView();
	refreshTemplatesTreeView();
}
