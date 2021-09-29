import { EditorCommands } from '../../commands';
import { FileTypes } from '../../fileTypes';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { ResourceTypes } from '../../kubernetes/kubernetesTypes';
import { GitRepository } from '../../kubernetes/gitRepository';
import { SourceNode } from './sourceNode';
import { NodeLabels } from './nodeLabels';
import { NodeContext } from './nodeContext';
import { shortenRevision } from '../../utils/stringUtils';

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
		super({
			label: `${NodeLabels.GitRepository}: ${gitRepository.metadata?.name}`,
			description: shortenRevision(gitRepository.status.artifact?.revision),
		});

		// save git repository resource reference
		this.resource = gitRepository;

		// set context type value for git repository commands
		this.contextValue = NodeContext.GitRepository;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(gitRepository);

		// set resource Uri to open git repository config document in editor
		const resourceUri = kubernetesTools.getResourceUri(
			gitRepository.metadata?.namespace,
			`${ResourceTypes.GitRepository}/${gitRepository.metadata?.name}`,
			FileTypes.Yaml);

		// set open resource in editor command
		this.command = {
			command: EditorCommands.OpenResource,
			arguments: [resourceUri],
			title: 'View Resource',
		};
	}
}
