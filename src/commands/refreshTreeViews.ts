import { syncKubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { reloadClustersTreeView, reloadSourcesTreeView, reloadTemplatesTreeView, reloadWorkloadsTreeView, sourceDataProvider, templateDateProvider, workloadDataProvider } from '../ui/treeviews/treeViews';

/**
 * Clicked button on the cluster tree view
 */

export async function refreshAllTreeViewsCommand() {
	await syncKubeConfig(true);
	refreshAllTreeViews();
}

export async function refreshAllTreeViews() {

	reloadClustersTreeView();
	refreshResourcesTreeViews();
}


/**
 * Clicked button on the sources or workloads tree view
 */
export function refreshResourcesTreeViewsCommand() {
	refreshResourcesTreeViews();
}

export function refreshResourcesTreeViews() {
	reloadSourcesTreeView();
	reloadWorkloadsTreeView();
	reloadTemplatesTreeView();
}

export function redrawhResourcesTreeViews() {
	sourceDataProvider.redraw();
	workloadDataProvider.redraw();
	templateDateProvider.redraw();
}
