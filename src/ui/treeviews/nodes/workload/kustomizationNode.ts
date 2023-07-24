import { Kind } from 'types/kubernetes/kubernetesTypes';
import { Kustomization } from 'types/flux/kustomization';
import { NodeContext } from 'types/nodeContext';
import { WorkloadNode } from './workloadNode';

/**
 * Defines Kustomization tree view item for display in GitOps Workload tree view.
 */
export class KustomizationNode extends WorkloadNode {
	/**
	 * Kustomize kubernetes resource object
	 */
	resource: Kustomization;

	/**
	 * Creates new app kustomization tree view item for display.
	 * @param kustomization Kustomize kubernetes object info.
	 */
	constructor(kustomization: Kustomization) {
		super(kustomization.metadata?.name || '', kustomization);

		this.resource = kustomization;

		this.makeCollapsible();
	}

	get contexts() {
		const contextsArr: string[] = [Kind.Kustomization];
		contextsArr.push(
			this.resource.spec.suspend ? NodeContext.Suspend : NodeContext.NotSuspend,
		);
		return contextsArr;
	}
}
