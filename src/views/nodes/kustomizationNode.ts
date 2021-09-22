import { EditorCommands } from '../../commands';
import { FileTypes } from '../../fileTypes';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { ResourceTypes } from '../../kubernetes/kubernetesTypes';
import { Kustomize } from '../../kubernetes/kustomize';
import { ApplicationNode } from './applicationNode';
import { NodeLabels } from './nodeLabels';
import { NodeContext } from './nodeContext';

/**
 * Defines Kustomization tree view item for display in GitOps Application tree view.
 */
 export class KustomizationNode extends ApplicationNode {

	/**
	 * Kustomize kubernetes resource object
	 */
 resource: Kustomize;

	/**
	 * Creates new app kustomization tree view item for display.
	 * @param kustomization Kustomize kubernetes object info.
	 */
	constructor(kustomization: Kustomize) {
		super({
			label: `${NodeLabels.Kustomization}: ${kustomization.metadata?.name}`,
		});

		// save kustomization resource reference
		this.resource = kustomization;

		// set context type value for kustomization commands
		this.contextValue = NodeContext.Kustomization;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(kustomization);

		// set resource Uri to open kustomization document in editor
		this.resourceUri = kubernetesTools.getResourceUri(
			kustomization.metadata?.namespace,
			`${ResourceTypes.Kustomization}/${kustomization.metadata?.name}`,
			FileTypes.Yaml);

		// set open resource in editor command
		this.command = {
			command: EditorCommands.OpenResource,
			arguments: [this.resourceUri],
			title: 'View Resource',
		};
	}
}
