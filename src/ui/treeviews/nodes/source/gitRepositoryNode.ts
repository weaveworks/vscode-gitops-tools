import { GitRepository } from 'types/flux/gitRepository';
import { SourceNode } from './sourceNode';

/**
 * Defines GitRepository tree view item for display in GitOps Sources tree view.
 */
export class GitRepositoryNode extends SourceNode {
	resource!: GitRepository;
}
