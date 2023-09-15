import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { TreeNode, TreeNodeIcon } from '../ui/treeviews/nodes/treeNode';


export enum InfoNode {
	FailedToLoad,
	NoResources,
	Loading,
	LoadingApi,
	ClusterUnreachable,
}

export function infoNodes(type: InfoNode) {
	return [infoNode(type)];
}

export function infoNode(type: InfoNode) {
	let node;

	switch(type) {
		case InfoNode.FailedToLoad:
			node = new TreeNode('Failed to load');
			node.setIcon(TreeNodeIcon.Disconnected);
			return node;
		case InfoNode.NoResources:
			return new TreeNode('No Resources');
		case InfoNode.Loading:
			node = new TreeNode('Loading...');
			node.setIcon(TreeNodeIcon.Loading);
			return node;
		case InfoNode.LoadingApi:
			node = new TreeNode('Loading API...');
			node.setIcon(TreeNodeIcon.Loading);
			return node;
		case InfoNode.ClusterUnreachable:
			const name = kubeConfig.currentContext;
			node = new TreeNode(`Cluster ${name} unreachable`);
			node.setIcon(TreeNodeIcon.Disconnected);
			return node;
	}
}

