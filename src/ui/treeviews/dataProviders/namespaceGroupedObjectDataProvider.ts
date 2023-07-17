import { KubernetesObject } from 'types/kubernetes/kubernetesTypes';
import { DataProvider } from './dataProvider';
import { NamespaceNode } from '../nodes/namespaceNode';
import { getNamespace, getNamespaces } from 'cli/kubernetes/kubectlGet';
import { GitRepositoryNode } from '../nodes/source/gitRepositoryNode';
import { GitRepository } from 'types/flux/gitRepository';

/**
 * Superclass for data providers that group objects by namespace: Source and Workload data providers
 */
export abstract class NamespaceGroupedObjectDataProvider extends DataProvider {

	public namespaceNodeTreeItems(): NamespaceNode[] {
		return (this.treeItems?.filter(node => node instanceof NamespaceNode) as NamespaceNode[] || []);
	}



	public async add(object: KubernetesObject) {
		if(!object.metadata?.namespace) {
			return;
		}

		const titems = this.treeItems;
		const nsName = object.metadata?.namespace;
		let namespaceNode = this.namespaceNodeTreeItems().find(node => node.resource?.metadata?.name === nsName);
		if(!namespaceNode) {
			const ns = await getNamespace(nsName);
			if(!ns) {
				return;
			}
			namespaceNode = new NamespaceNode(ns);
			this.treeItems?.push(namespaceNode);
			this.sortTreeItems();
		}

		const resourceNode = new GitRepositoryNode(object as GitRepository);
		namespaceNode.addChild(resourceNode);
		// find or create namespace TreeItem for node
		// add update TreeItem
		// this.refresh(treeItem)
		this._onDidChangeTreeData.fire(undefined);
	}

	public update(object: KubernetesObject) {
		// find or create namespace TreeItem for node
		// add update TreeItem
		// this.refresh(treeItem)
		console.log('update', object);

		const nsName = object.metadata?.namespace;
		const namespaceNode = this.namespaceNodeTreeItems().find(node => node.resource?.metadata?.name === nsName);
		if(!namespaceNode) {
			return;
		}

		const node = namespaceNode.findChildByResource(object);
		if(node && node.resource) {
			// const oldResource = node.resource;
			node.resource = object;

			// const m1 = oldResource.metadata;
			// if(oldResource.metadata?.resourceVersion !== object.metadata?.resourceVersion) {
			// 	// resourceVersion changed, update TreeItem
			// 	this._onDidChangeTreeData.fire(node);
			// }
			this._onDidChangeTreeData.fire(node);
		}
	}

	public delete(object: KubernetesObject) {
		// find or create namespace TreeItem for node
		// add update TreeItem
		// this.refresh(treeItem)
		console.log('delete', object);

		if(!object.metadata?.namespace) {
			return;
		}

		const titems = this.treeItems;

		const nsName = object.metadata?.namespace;
		const namespaceNode = this.namespaceNodeTreeItems().find(node => node.resource?.metadata?.name === nsName);
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
