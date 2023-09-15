import { GitRepository } from 'types/flux/gitRepository';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { NodeContext } from 'types/nodeContext';
import { SourceNode } from './sourceNode';

/**
 * Defines GitRepository tree view item for display in GitOps Sources tree view.
 */
export class GitRepositoryNode extends SourceNode {
	resource!: GitRepository;


	get contexts() {
		const contextsArr: string[] = [Kind.GitRepository];
		contextsArr.push(
			this.resource.spec.suspend ? NodeContext.Suspend : NodeContext.NotSuspend,
		);
		return contextsArr;
	}
}
