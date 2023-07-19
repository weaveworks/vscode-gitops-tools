import { loadKubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { refreshClustersTreeView, refreshSourcesTreeView, refreshTemplatesTreeView, refreshWorkloadsTreeView } from '../ui/treeviews/treeViews';

/**
 * Clicked button on the cluster tree view
 */

export async function refreshAllTreeViewsCommand() {
	await loadKubeConfig(true);
	// give proxy a chance to start
	setTimeout(() => {
		refreshAllTreeViews();
	}, 100);
}

export async function refreshAllTreeViews() {
	console.log('refreshAllTreeViews');

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
