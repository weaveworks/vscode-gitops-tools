import {
  ExtensionContext,
  window
} from 'vscode';
import { LinkTreeViewDataProvider } from './views/linkTreeViewDataProvider';
import { Views } from './views/views';

export function activate(context: ExtensionContext) {
	// create documentation links sidebar tree view section
	window.createTreeView(Views.DocumentationView, {
		treeDataProvider: new LinkTreeViewDataProvider(),
		showCollapseAll: true,
	});
}

export function deactivate() {}
