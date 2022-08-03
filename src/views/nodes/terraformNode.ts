import { KubernetesObjectKinds } from '../../kubernetes/kubernetesTypes';
import { Terraform } from '../../kubernetes/terraform';
import { NodeContext } from './nodeContext';
import { WorkloadNode } from './workloadNode';

/**
 * Defines Kustomization tree view item for display in GitOps Workload tree view.
 */
export class TerraformNode extends WorkloadNode {
	/**
	 * Kustomize kubernetes resource object
	 */
	resource: Terraform;

	/**
	 * Creates new terraform tree view item for display.
	 * @param terraform Terraform kubernetes object info.
	 */
	constructor(terraform: Terraform) {
		super(terraform.metadata?.name || '', terraform);

		this.resource = terraform;

		// this.makeCollapsible();
	}

	get contexts() {
		const contextsArr: string[] = [KubernetesObjectKinds.Kustomization];
		contextsArr.push(
			this.resource.spec.suspend ? NodeContext.Suspend : NodeContext.NotSuspend,
		);
		return contextsArr;
	}
}
