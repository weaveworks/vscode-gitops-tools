import { GitRepository } from '../../kubernetes/types/flux/gitRepository';
import { KubernetesObjectKinds } from '../../kubernetes/types/kubernetesTypes';
import { NodeContext } from './nodeContext';
import { SourceNode } from './sourceNode';

/**
 * Defines GitRepository tree view item for display in GitOps Sources tree view.
 */
export class GitRepositoryNode extends SourceNode {

	/**
	 * Git repository kubernetes resource object
	 */
	resource: GitRepository;

	/**
	 * Creates new git repository tree view item for display.
	 * @param gitRepository Git repository kubernetes object info.
	 */
	constructor(gitRepository: GitRepository) {
		super(`${KubernetesObjectKinds.GitRepository}: ${gitRepository.metadata?.name}`, gitRepository);

		this.resource = gitRepository;
	}

	get contexts() {
		const contextsArr: string[] = [KubernetesObjectKinds.GitRepository];
		contextsArr.push(
			this.resource.spec.suspend ? NodeContext.Suspend : NodeContext.NotSuspend,
		);
		return contextsArr;
	}
}
