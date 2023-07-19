import { getNamespace } from 'cli/kubernetes/kubectlGetNamespace';
import { GitRepository } from 'types/flux/gitRepository';
import { KubernetesObject, Namespace } from 'types/kubernetes/kubernetesTypes';
import { NamespaceNode } from '../nodes/namespaceNode';
import { GitRepositoryNode } from '../nodes/source/gitRepositoryNode';
import { DataProvider } from './dataProvider';
import { sortNodes } from 'utils/treeNodeUtils';

/**
 * Superclass for data providers that group objects by namespace: Source and Workload data providers
 */
export abstract class KubernetesObjectDataProvider extends DataProvider {

	public namespaceNodeTreeItems(): NamespaceNode[] {
		return (this.treeItems?.filter(node => node instanceof NamespaceNode) as NamespaceNode[] || []);
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
		console.log('add', object);

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
			this.treeItems?.push(namespaceNode);
			sortNodes(this.treeItems);
			namespaceNode.expand();
			this._onDidChangeTreeData.fire(undefined);
		}


		if(namespaceNode.findChildByResource(object)) {
			this.update(object);
			return;
		}

		const resourceNode = new GitRepositoryNode(object as GitRepository);
		namespaceNode.addChild(resourceNode);
		sortNodes(namespaceNode.children);

		this._onDidChangeTreeData.fire(namespaceNode);
	}

	public update(object: KubernetesObject) {
		// console.log('update', object);
		// console.log('treeitems', this.treeItems);


		const namespaceNode = this.findParentNamespaceNode(object);
		if(!namespaceNode) {
			return;
		}

		const node = namespaceNode.findChildByResource(object);
		if(node && node.resource) {
			// console.log('old', node.resource?.metadata, node.resource?.spec, node.resource?.status);
			// console.log('new', object.metadata, object.spec, object.status);
			// console.log('equals?',
			// 	deepEqual(node.resource?.metadata, object.metadata),
			// 	deepEqual(node.resource?.spec, object.spec),
			// 	deepEqual(node.resource?.status, object.status));
			node.resource = object;
			node.updateStatus();
			this._onDidChangeTreeData.fire(node);
		}
	}

	public delete(object: KubernetesObject) {
		console.log('delete', object);

		const namespaceNode = this.findParentNamespaceNode(object);
		if(!namespaceNode) {
			return;
		}

		const childNode = namespaceNode.findChildByResource(object);
		if(childNode) {
			namespaceNode.removeChild(childNode);
			if(namespaceNode.children.length > 0) {
				// namespace has other children
				this._onDidChangeTreeData.fire(namespaceNode);
			} else {
				// namespace has no more children. should be removed
				this.treeItems?.splice(this.treeItems?.indexOf(namespaceNode), 1);
				this._onDidChangeTreeData.fire(undefined);
			}
		}
	}

}
