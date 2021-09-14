import { MarkdownString } from 'vscode';
import { EditorCommands } from '../commands';
import { FileTypes } from '../fileTypes';
import { Deployment } from '../kubernetes/deployment';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { ResourceTypes } from '../kubernetes/kubernetesTypes';
import { createMarkdownTable } from '../utils/stringUtils';
import { TreeViewItem } from './treeViewItem';
import { TreeViewItemContext } from './treeViewItemContext';

/**
 * Defines deployment tree view item for display in GitOps Clusters tree view.
 */
export class ClusterDeploymentTreeViewItem extends TreeViewItem {
	constructor(deployment: Deployment) {
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
	 * @param showJsonConfig Optional show Json config flag for dev debug.
	 * @returns Markdown string to use for Deployment tree view item tooltip.
	 */
	getMarkdown(deployment: Deployment, showJsonConfig: boolean = false): MarkdownString {

		const markdown: MarkdownString = createMarkdownTable(deployment);

		if (showJsonConfig) {
			markdown.appendCodeblock(JSON.stringify(deployment, null, '  '));
		}

		return markdown;
	}
}

