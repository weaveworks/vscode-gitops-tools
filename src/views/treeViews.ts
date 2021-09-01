import { window } from 'vscode';
import { ClusterTreeViewDataProvider } from './clusterTreeViewDataProvider';
import { DeploymentTreeViewDataProvider } from './deploymentTreeViewDataProvider';
import { DocumentationTreeViewDataProvider } from './documentationTreeViewDataProvider';
import { SourceTreeViewDataProvider } from './sourceTreeViewDataProvider';
import { Views } from './views';

let clusterTreeViewProvider = new ClusterTreeViewDataProvider();
let sourceTreeViewProvider = new SourceTreeViewDataProvider();
let deploymentTreeViewProvider = new DeploymentTreeViewDataProvider();
let documentationTreeViewProvider = new DocumentationTreeViewDataProvider();

export function createAllTreeViews() {
	// create gitops sidebar tree views
  window.createTreeView(Views.ClusterView, {
    treeDataProvider: clusterTreeViewProvider,
    showCollapseAll: true,
  });

	window.createTreeView(Views.SourceView, {
    treeDataProvider: sourceTreeViewProvider,
    showCollapseAll: true,
  });

	window.createTreeView(Views.DeploymentView, {
    treeDataProvider: deploymentTreeViewProvider,
    showCollapseAll: true,
  });

	// create documentation links sidebar tree view
	window.createTreeView(Views.DocumentationView, {
		treeDataProvider: documentationTreeViewProvider,
		showCollapseAll: true,
	});
}

export function refreshClusterTreeView() {
	clusterTreeViewProvider.refresh();
}
export function refreshSourceTreeView() {
	sourceTreeViewProvider.refresh();
}
export function refreshDeploymentTreeView() {
	deploymentTreeViewProvider.refresh();
}
/**
 * Refresh all tree views (Except Documentation).
 */
export function refreshAllTreeViews() {
	refreshClusterTreeView();
	refreshSourceTreeView();
	refreshDeploymentTreeView();
}

