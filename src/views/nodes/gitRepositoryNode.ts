import { CommandId } from '../../commands';
import { FileTypes } from '../../fileTypes';
import { GitRepository } from '../../kubernetes/gitRepository';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { ResourceTypes } from '../../kubernetes/kubernetesTypes';
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

		// save git repository resource reference
		this.resource = gitRepository;

		// set resource Uri to open git repository config document in editor
		const resourceUri = kubernetesTools.getResourceUri(
			gitRepository.metadata?.namespace,
			`${ResourceTypes.GitRepository}/${gitRepository.metadata?.name}`,
			FileTypes.Yaml);

		// set open resource in editor command
		this.command = {
			command: CommandId.EditorOpenResource,
			arguments: [resourceUri],
			title: 'View Resource',
		};
	}

	// @ts-ignore
	get contextValue(): string {
		let suspendContext = this.resource.spec.suspend ? NodeContext.Suspend : NodeContext.NotSuspend;

		return this.joinContexts(NodeContext.GitRepository, suspendContext);
	}
}
