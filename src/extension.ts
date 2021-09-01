import {
	ExtensionContext,
	commands,
	window
} from 'vscode';
import { registerCommands, FluxCommands, KubectlCommands } from './commands';
import { ClusterTreeViewDataProvider } from './views/clusterTreeViewDataProvider';
import { DeploymentTreeViewDataProvider } from './views/deploymentTreeViewDataProvider';
import { DocumentationTreeViewDataProvider } from './views/documentationTreeViewDataProvider';
import { SourceTreeViewDataProvider } from './views/sourceTreeViewDataProvider';
import { Views } from './views/views';

/**
 * Activates GitOps extension.
 * @param context VSCode extension context.
 */
export function activate(context: ExtensionContext) {
	// create gitops sidebar tree views
  window.createTreeView(Views.ClusterView, {
    treeDataProvider: new ClusterTreeViewDataProvider(),
    showCollapseAll: true,
  });

	window.createTreeView(Views.SourceView, {
    treeDataProvider: new SourceTreeViewDataProvider(),
    showCollapseAll: true,
  });

	window.createTreeView(Views.DeploymentView, {
    treeDataProvider: new DeploymentTreeViewDataProvider(),
    showCollapseAll: true,
  });

	// create documentation links sidebar tree view
	window.createTreeView(Views.DocumentationView, {
		treeDataProvider: new DocumentationTreeViewDataProvider(),
		showCollapseAll: true,
	});

	// register gitops commands
	registerCommands(context);

	// show kubectl version in gitops terminal
	commands.executeCommand(KubectlCommands.Version);

	// run Flux prerequisites check
	commands.executeCommand(FluxCommands.CheckPrerequisites);
}

export function deactivate() {}
