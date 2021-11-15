import { Kustomize } from '../../kubernetes/kustomize';
import { ApplicationNode } from './applicationNode';
import { NodeContext } from './nodeContext';
import { NodeLabels } from './nodeLabels';

/**
 * Defines Kustomization tree view item for display in GitOps Application tree view.
 */
export class KustomizationNode extends ApplicationNode {

	contextValue = NodeContext.Kustomization;

	/**
	 * Kustomize kubernetes resource object
	 */
	resource: Kustomize;

	/**
	 * Creates new app kustomization tree view item for display.
	 * @param kustomization Kustomize kubernetes object info.
	 */
	constructor(kustomization: Kustomize) {
		super(kustomization.metadata?.name || '');

		this.description = NodeLabels.Kustomization;

		this.resource = kustomization;

		this.makeCollapsible();
	}
}
