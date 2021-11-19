import { ContextTypes, setContext } from '../../context';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { KubernetesObjectKinds, NamespaceResult } from '../../kubernetes/kubernetesTypes';
import { statusBar } from '../../statusBar';
import { AnyResourceNode } from '../nodes/anyResourceNode';
import { HelmReleaseNode } from '../nodes/helmReleaseNode';
import { KustomizationNode } from '../nodes/kustomizationNode';
import { NamespaceNode } from '../nodes/namespaceNode';
import { TreeNode } from '../nodes/treeNode';
import { WorkloadNode } from '../nodes/workloadNode';
import { refreshWorkloadTreeView } from '../treeViews';
import { DataProvider } from './dataProvider';

/**
 * Defines Workloads data provider for loading Kustomizations
 * and Helm Releases in GitOps Applictions tree view.
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

		setContext(ContextTypes.LoadingWorkloads, true);

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
			for (const kustomizeWorkload of kustomizations.items) {
				workloadNodes.push(new KustomizationNode(kustomizeWorkload));
			}
		}

		if (helmReleases) {
			for (const helmRelease of helmReleases.items) {
				workloadNodes.push(new HelmReleaseNode(helmRelease));
			}
		}

		for (const node of workloadNodes) {
			this.updateWorkloadChildren(node);
		}

		setContext(ContextTypes.LoadingWorkloads, false);
		setContext(ContextTypes.NoWorkloads, workloadNodes.length === 0);
		statusBar.stopLoadingTree();

		return workloadNodes;
	}

	/**
	 * Fetch all kubernetes resources that were created by a kustomize/helmRelease
	 * and add them as child nodes of the workload.
	 * @param workloadNode target workload node
	 */
	async updateWorkloadChildren(workloadNode: WorkloadNode) {
		const name = workloadNode.resource.metadata.name || '';
		const namespace = workloadNode.resource.metadata.namespace || '';

		let workloadChildren;
		if (workloadNode instanceof KustomizationNode) {
			workloadChildren = await kubernetesTools.getChildrenOfWorkload('kustomize', name, namespace);
		} else if (workloadNode instanceof HelmReleaseNode) {
			workloadChildren = await kubernetesTools.getChildrenOfWorkload('helm', name, namespace);
		}

		if (!workloadChildren) {
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
		workloadNode.children = namespaceNodes.filter(namespaceNode => !exceptNamespaces.some(exceptNamespace => exceptNamespace !== namespaceNode.resource.metadata.name) && namespaceNode.children.length);

		refreshWorkloadTreeView(workloadNode);
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
