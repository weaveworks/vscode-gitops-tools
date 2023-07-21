import { TreeNode } from 'ui/treeviews/nodes/treeNode';
import { sourceDataProvider, sourceTreeView, workloadDataProvider } from 'ui/treeviews/treeViews';
import { TreeItemCollapsibleState } from 'vscode';

export async function expandAllSources() {
	sourceDataProvider.expandNewTree = true;
	sourceDataProvider.refresh();
}

export async function expandAllWorkloads() {
	workloadDataProvider.expandNewTree = true;
	workloadDataProvider.refresh();
}
