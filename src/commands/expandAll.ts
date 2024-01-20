import { sourceDataProvider, workloadDataProvider } from 'ui/treeviews/treeViews';

export async function expandAllSources() {
	sourceDataProvider.expandAll();
}

export async function expandAllWorkloads() {
	workloadDataProvider.expandAll();
}
