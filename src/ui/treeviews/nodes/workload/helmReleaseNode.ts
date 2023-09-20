import { HelmRelease } from 'types/flux/helmRelease';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { NodeContext } from 'types/nodeContext';
import { shortenRevision } from 'utils/stringUtils';
import { WorkloadNode } from './workloadNode';

/**
 * Defines Helm release tree view item for display in GitOps Workloads tree view.
 */
export class HelmReleaseNode extends WorkloadNode {
	resource!: HelmRelease;

	/**
	 * Creates new helm release tree view item for display.
	 * @param helmRelease Helm release kubernetes object info.
	 */
	constructor(helmRelease: HelmRelease) {
		super(helmRelease);

		this.makeCollapsible();
	}

	get revision() {
		return shortenRevision(this.resource.status.lastAppliedRevision);
	}

	get contexts() {
		const contextsArr: string[] = [Kind.HelmRelease];
		contextsArr.push(
			this.resource.spec.suspend ? NodeContext.Suspend : NodeContext.NotSuspend,
		);
		return contextsArr;
	}
}
