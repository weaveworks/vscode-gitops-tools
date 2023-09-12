import { getNamespace } from 'cli/kubernetes/kubectlGetNamespace';
import { currentContextData } from 'data/contextData';
import { GitRepository } from 'types/flux/gitRepository';
import { KubernetesObject } from 'types/kubernetes/kubernetesTypes';
import { groupNodesByNamespace, sortNodes } from 'utils/treeNodeUtils';
import { NamespaceNode } from '../nodes/namespaceNode';
import { GitRepositoryNode } from '../nodes/source/gitRepositoryNode';
import { TreeNode } from '../nodes/treeNode';
import { AsyncDataProvider } from './asyncDataProvider';

/**
 * Superclass for data providers that group objects by namespace: Source and Workload data providers
 */
export abstract class KubernetesObjectDataProvider extends AsyncDataProvider {
	public namespaceNodeTreeItems(): NamespaceNode[] {
		return (this.nodes?.filter(node => node instanceof NamespaceNode) as NamespaceNode[] || []);
	}

	private findNamespaceNode(nsName?: string): NamespaceNode | undefined {
		if(!nsName) {
			return;
		}
		return this.namespaceNodeTreeItems().find(node => node.resource?.metadata?.name === nsName);
	}

	private findParentNamespaceNode(object: KubernetesObject): NamespaceNode | undefined {
		const nsName = object.metadata?.namespace;
		return this.findNamespaceNode(nsName);
	}

	public async add(object: KubernetesObject) {
		if(!object.metadata?.namespace) {
			return;
		}

		let namespaceNode = this.findParentNamespaceNode(object);
		if(!namespaceNode) {
			const ns = await getNamespace(object.metadata?.namespace);
			if(!ns) {
				return;
			}
			namespaceNode = new NamespaceNode(ns);
			this.nodes?.push(namespaceNode);
			sortNodes(this.nodes);
			namespaceNode.expand();
			this.redraw();
		}


		if(namespaceNode.findChildByResource(object)) {
			this.update(object);
			namespaceNode.updateLabel();
			this.redraw(namespaceNode);
		const resourceNode = makeTreeNode(object);
		if(!resourceNode) {
			return;
		}

		const resourceNode = new GitRepositoryNode(object as GitRepository);
		namespaceNode.addChild(resourceNode);
		sortNodes(namespaceNode.children);

		namespaceNode.updateLabel();
		this.redraw(namespaceNode);
	}

	public update(object: KubernetesObject) {
		const namespaceNode = this.findParentNamespaceNode(object);
		if(!namespaceNode) {
			return;
		}

		const node = namespaceNode.findChildByResource(object);
		if(node && node.resource) {
			node.resource = object;
			node.updateStatus();
			namespaceNode.updateLabel();
			this.redraw(namespaceNode);
		}
	}

	public delete(object: KubernetesObject) {
		const namespaceNode = this.findParentNamespaceNode(object);
		if(!namespaceNode) {
			return;
		}

		const childNode = namespaceNode.findChildByResource(object);
		if(childNode) {
			namespaceNode.removeChild(childNode);
			if(namespaceNode.children.length > 0) {
				// namespace has other children
				namespaceNode.updateLabel();
				this.redraw(namespaceNode);
			} else {
				// namespace has no more children. should be removed
				this.nodes?.splice(this.nodes?.indexOf(namespaceNode), 1);
				this.redraw(undefined);
			}
		}
	}

	async expandAll() {
		const resourceNodes: TreeNode[] = [];

		this.nodes.forEach(node => {
			if (node instanceof NamespaceNode) {
				const children = node.children as TreeNode[];
				resourceNodes.push(...children);
			}
		});

		// rebuild top level nodes or the tree will not redraw
		const viewData = this.viewData(currentContextData());
		[viewData.nodes] = await groupNodesByNamespace(resourceNodes, true, true);
		this.redraw();
	}

}
