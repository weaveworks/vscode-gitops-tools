import { TreeNode } from 'ui/treeviews/nodes/treeNode';
import { sourceDataProvider, sourceTreeView, workloadDataProvider } from 'ui/treeviews/treeViews';
import { TreeItemCollapsibleState } from 'vscode';

export async function expandAllSources() {
	sourceDataProvider.expandAll();
}

export async function expandAllWorkloads() {
	sourceDataProvider.expandAll();
}
