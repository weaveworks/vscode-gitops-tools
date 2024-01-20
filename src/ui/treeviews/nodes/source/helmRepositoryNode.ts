import { HelmRepository } from 'types/flux/helmRepository';
import { SourceNode } from './sourceNode';

/**
 * Defines HelmRepository tree view item for display in GitOps Sources tree view.
 */
export class HelmRepositoryNode extends SourceNode {
	resource!: HelmRepository;
}
