import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { CommonIcon } from 'ui/icons';
import { SimpleDataProvider } from 'ui/treeviews/dataProviders/simpleDataProvider';
import { TreeNode } from '../ui/treeviews/nodes/treeNode';


export enum InfoLabel {
	FailedToLoad,
	NoResources,
	Loading,
	LoadingApi,
	ClusterUnreachable,
}

export function infoNodes(type: InfoLabel, provider: SimpleDataProvider) {
	return [infoNode(type, provider)];
}

export function infoNode(type: InfoLabel, provider: SimpleDataProvider) {
	let node;

	switch(type) {
		case InfoLabel.FailedToLoad:
			node = new TreeNode('Failed to load', provider);
			node.setCommonIcon(CommonIcon.Disconnected);
			return node;
		case InfoLabel.NoResources:
			return new TreeNode('No Resources', provider);
		case InfoLabel.Loading:
			node = new TreeNode('Loading...', provider);
			node.setCommonIcon(CommonIcon.Loading);
			return node;
		case InfoLabel.LoadingApi:
			node = new TreeNode('Loading API...', provider);
			node.setCommonIcon(CommonIcon.Loading);
			return node;
		case InfoLabel.ClusterUnreachable:
			const name = kubeConfig.currentContext;
			node = new TreeNode(`Cluster ${name} unreachable`, provider);
			node.setCommonIcon(CommonIcon.Disconnected);
			return node;
	}
}

