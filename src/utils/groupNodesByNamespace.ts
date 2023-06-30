import { Namespace } from 'types/kubernetes/kubernetesTypes';
import { NamespaceNode } from '../ui/treeviews/nodes/namespaceNode';
import { TreeNode } from '../ui/treeviews/nodes/treeNode';
import { getNamespaces } from 'cli/kubernetes/kubectlGet';


export async function groupNodesByNamespace(nodes: TreeNode[]): Promise<NamespaceNode[]> {
	const namespaces: Namespace[] = await getNamespaces();
	const namespaceNodes: NamespaceNode[] = [];

	namespaces.forEach(ns => {
		const name = ns.metadata.name;

		const nsChildNodes = nodes.filter(node => node.resource?.metadata?.namespace === name);
		if (nsChildNodes.length > 0) {
			const nsNode = new NamespaceNode(ns);
			nsChildNodes.forEach(childNode => nsNode.addChild(childNode));
			namespaceNodes.push(nsNode);
		}
	});

	return namespaceNodes;
}
