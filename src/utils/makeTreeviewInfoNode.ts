import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { CommonIcon } from 'ui/icons';
import { TreeNode } from '../ui/treeviews/nodes/treeNode';


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
			node.setCommonIcon(CommonIcon.Disconnected);
			return node;
		case InfoNode.NoResources:
			return new TreeNode('No Resources');
		case InfoNode.Loading:
			node = new TreeNode('Loading...');
			node.setCommonIcon(CommonIcon.Loading);
			return node;
		case InfoNode.LoadingApi:
			node = new TreeNode('Loading API...');
			node.setCommonIcon(CommonIcon.Loading);
			return node;
		case InfoNode.ClusterUnreachable:
			const name = kubeConfig.currentContext;
			node = new TreeNode(`Cluster ${name} unreachable`);
			node.setCommonIcon(CommonIcon.Disconnected);
			return node;
	}
}

