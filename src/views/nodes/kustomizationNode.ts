import { KubernetesObjectKinds } from '../../kubernetes/kubernetesTypes';
import { Kustomize } from '../../kubernetes/kustomize';
import { WorkloadNode } from './workloadNode';

/**
 * Defines Kustomization tree view item for display in GitOps Workload tree view.
 */
export class KustomizationNode extends WorkloadNode {
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

		this.description = KubernetesObjectKinds.Kustomization;

		this.resource = kustomization;

		this.makeCollapsible();
	}

	get contexts() {
		return [KubernetesObjectKinds.Kustomization];
	}
}
