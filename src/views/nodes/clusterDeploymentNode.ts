import { MarkdownString, ThemeColor, ThemeIcon } from 'vscode';
import { EditorCommands } from '../../commands';
import { FileTypes } from '../../fileTypes';
import { Deployment } from '../../kubernetes/deployment';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { ResourceTypes } from '../../kubernetes/kubernetesTypes';
import { createMarkdownTable } from '../../utils/stringUtils';
import { NodeContext } from './nodeContext';
import { TreeNode } from './treeNode';

/**
 * Defines deployment tree view item for display in GitOps Clusters tree view.
 */
export class ClusterDeploymentNode extends TreeNode {

	/**
	 * Cluster deployment kubernetes resource object
	 */
	resource: Deployment;

	constructor(deployment: Deployment) {
		super(deployment.metadata.name || '');

		this.resource = deployment;

		this.label = this.getImageName(deployment);

		this.setIcon(new ThemeIcon('circle-large-outline'));

		// set context type value for controller commands
		this.contextValue = NodeContext.Deployment;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(deployment);

		// set resource Uri to open controller document in editor
		const resourceUri = kubernetesTools.getResourceUri(
			deployment.metadata?.namespace,
			`${ResourceTypes.Deployment}/${deployment.metadata?.name}`,
			FileTypes.Yaml,
		);

		// set open resource in editor command
		this.command = {
			command: EditorCommands.OpenResource,
			arguments: [resourceUri],
			title: 'View Resource',
		};
	}

	/**
	 * Creates markdown string for Deployment tree view item tooltip.
	 * @param deployment controller object.
	 * @returns Markdown string to use for Deployment tree view item tooltip.
	 */
	getMarkdown(deployment: Deployment): MarkdownString {
		return createMarkdownTable(deployment);
	}

	/**
	 * Return the name of the image of the container
	 * @param deployment Flux deployment kubernetes object
	 * @returns Version of the flux controller or an empty string
	 */
	getImageName(deployment: Deployment): string {
		const fluxControllerContainer = deployment.spec.template.spec?.containers?.find(container => /fluxcd.+controller.+/.test(container.image || ''));
		return fluxControllerContainer?.image || '';
	}

	/**
	 * Show status of deployment by changing the icon.
	 * @param status Status of this deployment.
	 */
	setStatus(status: 'success' | 'failure') {
		if (status === 'success') {
			this.setIcon(new ThemeIcon('pass', new ThemeColor('terminal.ansiGreen')));
		} else if (status === 'failure') {
			this.setIcon(new ThemeIcon('warning', new ThemeColor('editorWarning.foreground')));
		}
	}
}

