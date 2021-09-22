import { MarkdownString } from 'vscode';
import { EditorCommands } from '../commands';
import { FileTypes } from '../fileTypes';
import { Deployment } from '../kubernetes/deployment';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { ResourceTypes } from '../kubernetes/kubernetesTypes';
import { createMarkdownTable } from '../utils/stringUtils';
import { TreeNode } from './treeNode';
import { NodeContext } from './nodeContext';

/**
 * Defines deployment tree view item for display in GitOps Clusters tree view.
 */
export class ClusterDeploymentNode extends TreeNode {
	constructor(deployment: Deployment) {
		super({
			label: deployment.metadata.name || '',
			description: `${deployment.status.readyReplicas}/${deployment.status.replicas}`,
		});

		this.label = `${deployment.metadata.name} ${this.getFluxControllerVersion(deployment)}`;

		// set context type value for controller commands
		this.contextValue = NodeContext.Deployment;

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
			markdown.appendCodeblock(JSON.stringify(deployment, null, '  '), 'json');
		}

		return markdown;
	}

	/**
	 * Get version of the flux controller
	 * @param deployment Deployment kubernetes object
	 * @returns Version of the flux controller or an empty string
	 */
	getFluxControllerVersion(deployment: Deployment): string {
		const fluxControllerContainer = deployment.spec.template.spec?.containers?.find(container => /fluxcd.+controller.+/.test(container.image || ''));
		return fluxControllerContainer?.image?.split(':')[1] || '';
	}
}

