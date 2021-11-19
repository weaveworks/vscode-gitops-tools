import { Kustomize } from '../../kubernetes/kustomize';
import { WorkloadNode } from './workloadNode';
import { NodeContext } from './nodeContext';
import { NodeLabels } from './nodeLabels';

/**
 * Defines Kustomization tree view item for display in GitOps Workload tree view.
 */
export class KustomizationNode extends WorkloadNode {

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
		super(kustomization.metadata?.name || '', kustomization);

		this.description = NodeLabels.Kustomization;

		this.resource = kustomization;

		this.makeCollapsible();
	}
}
