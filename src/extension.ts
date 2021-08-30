import {
	ExtensionContext,
	window
} from 'vscode';
import { ClusterTreeViewDataProvider } from './views/clusterTreeViewDataProvider';
import { DeploymentTreeViewDataProvider } from './views/deploymentTreeViewDataProvider';
import { LinkTreeViewDataProvider } from './views/linkTreeViewDataProvider';
import { SourceTreeViewDataProvider } from './views/sourceTreeViewDataProvider';
import { Views } from './views/views';

export function activate(context: ExtensionContext) {
	// create clusters tree view section
  window.createTreeView(Views.ClusterView, {
    treeDataProvider: new ClusterTreeViewDataProvider(),
    showCollapseAll: true,
  });
	 // create sources tree view section
  window.createTreeView(Views.SourceView, {
    treeDataProvider: new SourceTreeViewDataProvider(),
    showCollapseAll: true,
  });
  // create deployments tree view section
  window.createTreeView(Views.DeploymentView, {
    treeDataProvider: new DeploymentTreeViewDataProvider(),
    showCollapseAll: true,
  });
  // create documentation links sidebar tree view section
	window.createTreeView(Views.DocumentationView, {
		treeDataProvider: new LinkTreeViewDataProvider(),
		showCollapseAll: true,
	});
}

export function deactivate() {}
