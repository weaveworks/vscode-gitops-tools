import { GitRepository } from '../../kubernetes/gitRepository';
import { NodeContext } from './nodeContext';
import { NodeLabels } from './nodeLabels';
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
		super(`${NodeLabels.GitRepository}: ${gitRepository.metadata?.name}`, gitRepository);

		this.resource = gitRepository;
	}

	// @ts-ignore
	get contextValue(): string {
		let suspendContext = this.resource.spec.suspend ? NodeContext.Suspend : NodeContext.NotSuspend;

		return this.joinContexts(NodeContext.GitRepository, suspendContext);
	}
}
