import { V1Deployment } from '@kubernetes/client-node';
import { MarkdownString } from 'vscode';
import { EditorCommands } from '../commands';
import { FileTypes } from '../fileTypes';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { ResourceTypes } from '../kubernetes/kubernetesTypes';
import { TreeViewItem } from './treeViewItem';
import { TreeViewItemContext } from './treeViewItemContext';

/**
 * Defines deployment tree view item for display in GitOps Clusters tree view.
 */
export class DeploymentTreeViewItem2 extends TreeViewItem {
	constructor(deployment: V1Deployment) {
		super({
			label: deployment.metadata?.name || '',
			description: `${deployment.status?.readyReplicas}/${deployment.status?.replicas}`,
		});

		// set context type value for controller commands
		this.contextValue = TreeViewItemContext.Deployment;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(deployment);

		// set resource Uri to open controller document in editor
		this.resourceUri = kubernetesTools.getResourceUri(
			deployment.metadata?.namespace,
			`${ResourceTypes.Deployment}/${deployment.metadata?.name}`,
			FileTypes.Yaml
		);

		// set open resource in editor command
		this.command = {
			command: EditorCommands.OpenResource,
			arguments: [this.resourceUri],
			title: 'View Resource',
		};
	}

	/**
	 * Creates markdown string for Deployment tree view item tooltip.
	 * @param deployment controller object.
	 * @returns Markdown string to use for Deployment tree view item tooltip.
	 */
	getMarkdown(deployment: V1Deployment): MarkdownString {
		const markdown: MarkdownString = new MarkdownString();
		// markdown.appendCodeblock(JSON.stringify(deployment, null, '  '));
		return markdown;
	}
}

