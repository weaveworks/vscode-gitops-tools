import { EditorCommands } from '../../commands';
import { FileTypes } from '../../fileTypes';
import { HelmRelease } from '../../kubernetes/helmRelease';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { ResourceTypes } from '../../kubernetes/kubernetesTypes';
import { ApplicationNode } from './applicationNode';
import { NodeContext } from './nodeContext';
import { NodeLabels } from './nodeLabels';

/**
 * Defines Helm release tree view item for display in GitOps Applications tree view.
 */
export class HelmReleaseNode extends ApplicationNode {

	/**
	 * Helm release kubernetes resource object
	 */
	resource: HelmRelease;

	/**
	 * Creates new helm release tree view item for display.
	 * @param helmRelease Helm release kubernetes object info.
	 */
	constructor(helmRelease: HelmRelease) {
		super({
			label: `${NodeLabels.HelmRelease}: ${helmRelease.metadata?.name}`,
		});

		// save helm release resource reference
		this.resource = helmRelease;

		// set context type value for helm release commands
		this.contextValue = NodeContext.HelmRelease;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(helmRelease);

		// set resource Uri to open helm release config document in editor
		const resourceUri = kubernetesTools.getResourceUri(
			helmRelease.metadata?.namespace,
			`${ResourceTypes.HelmRelease}/${helmRelease.metadata?.name}`,
			FileTypes.Yaml);

		// set open resource in editor command
		this.command = {
			command: EditorCommands.OpenResource,
			arguments: [resourceUri],
			title: 'View Resource',
		};

	}
}
