import { fluxTools } from 'cli/flux/fluxTools';
import { getChildrenOfWorkload, getHelmReleases, getKustomizations, getNamespaces } from 'cli/kubernetes/kubectlGet';
import { setVSCodeContext } from 'extension';
import { ContextId } from 'types/extensionIds';
import { FluxTreeResources } from 'types/fluxCliTypes';
import { Kind, Namespace } from 'types/kubernetes/kubernetesTypes';
import { statusBar } from 'ui/statusBar';
import { sortByMetadataName } from 'utils/sortByMetadataName';
import { AnyResourceNode } from '../nodes/anyResourceNode';
import { HelmReleaseNode } from '../nodes/workload/helmReleaseNode';
import { KustomizationNode } from '../nodes/workload/kustomizationNode';
import { NamespaceNode } from '../nodes/namespaceNode';
import { TreeNode } from '../nodes/treeNode';
import { WorkloadNode } from '../nodes/workload/workloadNode';
import { refreshWorkloadsTreeView } from '../treeViews';
import { DataProvider } from './dataProvider';

/**
 * Defines data provider for loading Kustomizations
 * and Helm Releases in Workloads Tree View.
 */
export class WorkloadDataProvider extends DataProvider {

	namespaces: Namespace[] = [];

	/**
   * Creates Workload tree nodes for the currently selected kubernetes cluster.
   * @returns Workload tree nodes to display.
   */
	async buildTree(): Promise<NamespaceNode[]> {
		statusBar.startLoadingTree();

		const workloadNodes: WorkloadNode[] = [];

		setVSCodeContext(ContextId.LoadingWorkloads, true);

		const [kustomizations, helmReleases, namespaces] = await Promise.all([
			// Fetch all workloads
			getKustomizations(),
			getHelmReleases(),
			// Fetch namespaces to group the nodes
			getNamespaces(),
		]);

		this.namespaces = namespaces;

		for (const kustomizeWorkload of sortByMetadataName(kustomizations)) {
			workloadNodes.push(new KustomizationNode(kustomizeWorkload));
		}

		for (const helmRelease of sortByMetadataName(helmReleases)) {
			workloadNodes.push(new HelmReleaseNode(helmRelease));
		}

		for (const node of workloadNodes) {
			this.updateWorkloadChildren(node);
		}

		setVSCodeContext(ContextId.LoadingWorkloads, false);
		setVSCodeContext(ContextId.NoWorkloads, workloadNodes.length === 0);
		statusBar.stopLoadingTree();


		return this.groupByNamespace(namespaces, workloadNodes);
	}

	buildWorkloadsTree(node: TreeNode, resourceTree: FluxTreeResources[], parentNamespace = '') {
		for (const resource of resourceTree) {
			if (resource.resource.GroupKind.Kind === Kind.Namespace) {
				continue;
			}

			// Nested items have empty namespace https://github.com/fluxcd/flux2/issues/2149
			const namespace = resource.resource.Namespace || parentNamespace;

			const childNode = new AnyResourceNode({
				kind: resource.resource.GroupKind.Kind,
				metadata: {
					name: resource.resource.Name,
					namespace,
				},
			});

			node.addChild(childNode);

			if (resource.resources && resource.resources.length) {
				this.buildWorkloadsTree(childNode, resource.resources, namespace);
			}
		}
	}
	/**
	 * Fetch all kubernetes resources that were created by a kustomize/helmRelease
	 * and add them as child nodes of the workload.
	 * @param workloadNode target workload node
	 */
	async updateWorkloadChildren(workloadNode: WorkloadNode) {
		const name = workloadNode.resource.metadata?.name || '';
		const namespace = workloadNode.resource.metadata?.namespace || '';
		const targetNamespace = workloadNode.resource.spec.targetNamespace || namespace;

		let workloadChildren;
		if (workloadNode instanceof KustomizationNode) {
			const resourceTree = await fluxTools.tree(name, namespace);

			if (!resourceTree || !resourceTree.resources) {
				workloadNode.children = [new TreeNode('No Resources')];
				refreshWorkloadsTreeView(workloadNode);
				return;
			}

			this.buildWorkloadsTree(workloadNode, resourceTree.resources);
			refreshWorkloadsTreeView(workloadNode);

			return;
		} else if (workloadNode instanceof HelmReleaseNode) {
			// TODO: use `flux tree` to fetch the resources
			workloadChildren = await getChildrenOfWorkload('helm', name, targetNamespace);
		}

		if (!workloadChildren) {
			workloadNode.children = [new TreeNode('No Resources')];
			refreshWorkloadsTreeView(workloadNode);
			return;
		}

		// Get all namespaces
		const namespaces = this.namespaces || await getNamespaces();
		if (!namespaces) {
			return;
		}

		const namespaceNodes = namespaces.map(ns => new NamespaceNode(ns));
		namespaceNodes.forEach(namespaceNode => namespaceNode.expand());

		/*
		 * Do not delete empty namespace if it was in the fetched resources.
		 * Workloads can create namespace kubernetes resources.
		 */
		const exceptNamespaces: string[] = [];

		// group children of workload by namespace
		for (const namespaceNode of namespaceNodes) {
			for (const workloadChild of workloadChildren) {
				if (workloadChild.kind !== Kind.Namespace &&
					workloadChild.metadata?.namespace === namespaceNode.resource.metadata?.name) {
					namespaceNode.addChild(new AnyResourceNode(workloadChild));
				} else {
					const namespaceName = namespaceNode.resource.metadata?.name;
					if (namespaceName) {
						exceptNamespaces.push();
					}
				}
			}
		}

		// only show namespaces that are not empty
		workloadNode.children = namespaceNodes.filter(
			namespaceNode => !exceptNamespaces.some(exceptNamespace => exceptNamespace !== namespaceNode.resource.metadata?.name)
		&& namespaceNode.children.length);

		if(workloadNode.children.length === 0) {
			workloadNode.children = [new TreeNode('No Resources')];
		}

		refreshWorkloadsTreeView(workloadNode);
	}

	/**
	 * This is called when the tree node is being expanded.
	 * @param workloadNode target node or undefined when at the root level.
	 */
	async getChildren(workloadNode?: KustomizationNode | HelmReleaseNode) {
		if (workloadNode) {
			if (workloadNode.children.length) {
				return workloadNode.children;
			} else {
				return [new TreeNode('Loading...')];
			}
		} else {
			return await this.buildTree();
		}
	}
}
