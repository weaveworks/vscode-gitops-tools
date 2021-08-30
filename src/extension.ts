import {
	ExtensionContext,
	window
} from 'vscode';
import { ClusterTreeViewDataProvider } from './views/clusterTreeViewDataProvider';
import { DeploymentsTreeViewDataProvider } from './views/deploymentsTreeViewDataProvider';
import { LinkTreeViewDataProvider } from './views/linkTreeViewDataProvider';
import { SourcesTreeViewDataProvider } from './views/sourcesTreeViewDataProvider';
import { Views } from './views/views';

export function activate(context: ExtensionContext) {
	// create clusters tree view section
  window.createTreeView(Views.ClustersView, {
    treeDataProvider: new ClusterTreeViewDataProvider(),
    showCollapseAll: true,
  });
	 // create sources tree view section
  window.createTreeView(Views.SourcesView, {
    treeDataProvider: new SourcesTreeViewDataProvider(),
    showCollapseAll: true,
  });
  // create deployments tree view section
  window.createTreeView(Views.DeploymentsView, {
    treeDataProvider: new DeploymentsTreeViewDataProvider(),
    showCollapseAll: true,
  });
  // create documentation links sidebar tree view section
	window.createTreeView(Views.DocumentationView, {
		treeDataProvider: new LinkTreeViewDataProvider(),
		showCollapseAll: true,
	});
}

export function deactivate() {}
