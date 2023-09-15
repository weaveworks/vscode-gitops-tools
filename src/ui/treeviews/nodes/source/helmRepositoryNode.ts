import { HelmRepository } from 'types/flux/helmRepository';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { NodeContext } from 'types/nodeContext';
import { SourceNode } from './sourceNode';

/**
 * Defines HelmRepository tree view item for display in GitOps Sources tree view.
 */
export class HelmRepositoryNode extends SourceNode {
	resource!: HelmRepository;


	get contexts() {
		const contextsArr: string[] = [Kind.HelmRepository];
		contextsArr.push(
			this.resource.spec.suspend ? NodeContext.Suspend : NodeContext.NotSuspend,
		);
		return contextsArr;
	}
}
