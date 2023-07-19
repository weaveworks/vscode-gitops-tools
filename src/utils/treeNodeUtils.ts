import { getCachedNamespaces } from 'cli/kubernetes/kubectlGetNamespace';
import { FluxTreeResources } from 'types/fluxCliTypes';
import { Namespace } from 'types/kubernetes/kubernetesTypes';
import { AnyResourceNode } from 'ui/treeviews/nodes/anyResourceNode';
import { TreeItem } from 'vscode';
import { NamespaceNode } from '../ui/treeviews/nodes/namespaceNode';
import { TreeNode } from '../ui/treeviews/nodes/treeNode';


export async function addFluxTreeToNode(node: TreeNode, resourceTree: FluxTreeResources[], parentNamespace = '') {
	const nodes: TreeNode[] = [];
	for (const resource of resourceTree) {
		// Nested items have empty namespace https://github.com/fluxcd/flux2/issues/2149
		const namespace = resource.resource.Namespace || parentNamespace;

		const childNode = new AnyResourceNode({
			kind: resource.resource.GroupKind.Kind,
			metadata: {
				name: resource.resource.Name,
				namespace,
			},
		});

		nodes.push(childNode);

		if (resource.resources && resource.resources.length) {
			addFluxTreeToNode(childNode, resource.resources, namespace);
		}
	}

	const [groupedNodes, clusterScopedNodes] = await groupNodesByNamespace(nodes);
	clusterScopedNodes.forEach(csNode => node.addChild(csNode));
	groupedNodes.forEach(nsNode => node.addChild(nsNode));
}

// returns grouped by namespace, and ugroupable (cluster scoped) nodes
export async function groupNodesByNamespace(nodes: TreeNode[]): Promise<[NamespaceNode[], TreeNode[]]>  {
	const namespaces: Namespace[] = getCachedNamespaces();
	const namespaceNodes: NamespaceNode[] = [];

	namespaces.forEach(ns => {
		const nsName = ns.metadata.name!;

		const nsChildNodes = filterNodesForNamespace(nodes, nsName);
		if (nsChildNodes.length > 0) {
			const nsNode = new NamespaceNode(ns);
			nsChildNodes.forEach(childNode => {
				// Don't add the namespace node as a child of itself
				if(!(childNode.resource?.kind === 'Namespace' && childNode.resource.metadata?.name === nsName)) {
					 nsNode.addChild(childNode);
				}
			});
			namespaceNodes.push(nsNode);
		}
	});

	const clusterScopedNodes = nodes.filter(node => !node.resource?.metadata?.namespace && node.resource?.kind !== 'Namespace');
	return [namespaceNodes, clusterScopedNodes];
}

function filterNodesForNamespace(nodes: TreeNode[], namespace: string): TreeNode[] {
	const belongsToNamespace = (node: TreeNode) => node.resource?.metadata?.namespace === namespace;
	const isNamespace = (node: TreeNode) => node.resource?.kind === 'Namespace' && node.resource?.metadata?.name === namespace;

	return nodes.filter(node => belongsToNamespace(node) || isNamespace(node));
}


export function sortNodes(nodes?: TreeItem[] | null) {
	if(nodes) {
		nodes.sort((a, b) => {
			if(a.label && b.label) {
				const al = typeof a.label === 'string' ? a.label : a.label.label;
				const bl = typeof b.label === 'string' ? b.label : b.label.label;
				return al.localeCompare(bl);
			}
			return 0;
		});
	}
}
