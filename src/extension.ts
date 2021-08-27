import {
	ExtensionContext,
	window
} from 'vscode';
import { ClusterTreeViewDataProvider } from './views/treeViewProviders/clusterTreeViewDataProvider';
import { LinkTreeViewDataProvider } from './views/treeViewProviders/linkTreeViewDataProvider';
import { Views } from './views/views';

export function activate(context: ExtensionContext) {
  // create clusters tree view section
  window.createTreeView(Views.ClusterView, {
    treeDataProvider: new ClusterTreeViewDataProvider(),
    showCollapseAll: true,
  });
  // create documentation links sidebar tree view section
	window.createTreeView(Views.DocumentationView, {
		treeDataProvider: new LinkTreeViewDataProvider(),
		showCollapseAll: true,
	});
}

export function deactivate() {}
