import { Kustomization } from 'types/flux/kustomization';
import { shortenRevision } from 'utils/stringUtils';
import { WorkloadNode } from './workloadNode';

/**
 * Defines Kustomization tree view item for display in GitOps Workload tree view.
 */
export class KustomizationNode extends WorkloadNode {
	resource!: Kustomization;

	/**
	 * Creates new app kustomization tree view item for display.
	 * @param kustomization Kustomize kubernetes object info.
	 */
	constructor(kustomization: Kustomization) {
		super(kustomization);

		this.makeCollapsible();
	}

	get revision() {
		return shortenRevision(this.resource.status.lastAppliedRevision);
	}

}
