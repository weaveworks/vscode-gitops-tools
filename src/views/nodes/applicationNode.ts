import { HelmRelease } from '../../kubernetes/helmRelease';
import { Kustomize } from '../../kubernetes/kustomize';
import { TreeNode } from './treeNode';

/**
 * Base class for all Application tree view items.
 */
export class ApplicationNode extends TreeNode {

	resource!: Kustomize | HelmRelease;

}
