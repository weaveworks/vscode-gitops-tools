import {
	ExtensionContext,
	window
} 
from 'vscode';
import {Views} from './views/views';
import {LinkTreeViewDataProvider} from './views/linkTreeViewDataProvider';

export function activate(context: ExtensionContext) {
	// create documentation links sidebar view section
	window.createTreeView(Views.DocumentationView, {
		treeDataProvider: new LinkTreeViewDataProvider(),
		showCollapseAll: false,
	});
}

export function deactivate() {}
