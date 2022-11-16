import { ContextTypes, setVSCodeContext } from '../../vscodeContext';
import { fluxTools } from '../../flux/fluxTools';
import { FluxTreeResources } from '../../flux/fluxTypes';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { KubernetesObjectKinds, NamespaceResult } from '../../kubernetes/types/kubernetesTypes';
import { statusBar } from '../../statusBar';
import { AnyResourceNode } from '../nodes/anyResourceNode';
import { HelmReleaseNode } from '../nodes/helmReleaseNode';
import { KustomizationNode } from '../nodes/kustomizationNode';
import { NamespaceNode } from '../nodes/namespaceNode';
import { TreeNode } from '../nodes/treeNode';
import { WorkloadNode } from '../nodes/workloadNode';
import { refreshWorkloadsTreeView } from '../treeViews';
import { DataProvider } from './dataProvider';
import { sortByMetadataName } from '../../kubernetes/kubernetesUtils';

/**
 * Defines data provider for loading Kustomizations
 * and Helm Releases in Workloads Tree View.
 */
export class WorkloadDataProvider extends DataProvider {

	namespaceResult?: NamespaceResult;

	/**
   * Creates Workload tree nodes for the currently selected kubernetes cluster.
   * @returns Workload tree nodes to display.
   */
	async buildTree(): Promise<WorkloadNode[]> {
		statusBar.startLoadingTree();

		const workloadNodes: WorkloadNode[] = [];

		setVSCodeContext(ContextTypes.LoadingWorkloads, true);

		const [kustomizations, helmReleases, namespaces] = await Promise.all([
			// Fetch all workloads
			kubernetesTools.getKustomizations(),
			kubernetesTools.getHelmReleases(),
			// Fetch namespaces to group the nodes
			kubernetesTools.getNamespaces(),
			// cache resource kinds
			kubernetesTools.getAvailableResourceKinds(),
		]);

		this.namespaceResult = namespaces;

		if (kustomizations) {
			for (const kustomizeWorkload of sortByMetadataName(kustomizations.items)) {
				workloadNodes.push(new KustomizationNode(kustomizeWorkload));
			}
		}

		if (helmReleases) {
			for (const helmRelease of sortByMetadataName(helmReleases.items)) {
				workloadNodes.push(new HelmReleaseNode(helmRelease));
			}
		}

		for (const node of workloadNodes) {
			this.updateWorkloadChildren(node);
		}

		setVSCodeContext(ContextTypes.LoadingWorkloads, false);
		setVSCodeContext(ContextTypes.NoWorkloads, workloadNodes.length === 0);
		statusBar.stopLoadingTree();

		return workloadNodes;
	}

	buildWorkloadsTree(node: TreeNode, resourceTree: FluxTreeResources[], parentNamespace = '') {
		for (const resource of resourceTree) {
			if (resource.resource.GroupKind.Kind === KubernetesObjectKinds.Namespace) {
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
		const name = workloadNode.resource.metadata.name || '';
		const namespace = workloadNode.resource.metadata.namespace || '';
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
			workloadChildren = await kubernetesTools.getChildrenOfWorkload('helm', name, targetNamespace);
		}

		if (!workloadChildren) {
			workloadNode.children = [new TreeNode('No Resources')];
			refreshWorkloadsTreeView(workloadNode);
			return;
		}

		// Get all namespaces
		const namespaces = this.namespaceResult || await kubernetesTools.getNamespaces();
		if (!namespaces) {
			return;
		}

		const namespaceNodes = namespaces.items.map(ns => new NamespaceNode(ns));
		namespaceNodes.forEach(namespaceNode => namespaceNode.expand());

		/*
		 * Do not delete empty namespace if it was in the fetched resources.
		 * Workloads can create namespace kubernetes resources.
		 */
		const exceptNamespaces: string[] = [];

		// group children of workload by namespace
		for (const namespaceNode of namespaceNodes) {
			for (const workloadChild of workloadChildren.items) {
				if (workloadChild.kind !== KubernetesObjectKinds.Namespace &&
					workloadChild.metadata?.namespace === namespaceNode.resource.metadata.name) {
					namespaceNode.addChild(new AnyResourceNode(workloadChild));
				} else {
					const namespaceName = namespaceNode.resource.metadata.name;
					if (namespaceName) {
						exceptNamespaces.push();
					}
				}
			}
		}

		// only show namespaces that are not empty
		workloadNode.children = namespaceNodes.filter(
			namespaceNode => !exceptNamespaces.some(exceptNamespace => exceptNamespace !== namespaceNode.resource.metadata.name)
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
