import { clusterDataProvider } from 'ui/treeviews/treeViews';
import { TreeNode } from '../treeNode';

export class ClusterTreeNode extends TreeNode {
	constructor(label: string) {
		super(label, clusterDataProvider);
	}
}
