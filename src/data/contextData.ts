import { getResource } from 'cli/kubernetes/kubectlGet';
import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { HelmRelease } from 'types/flux/helmRelease';
import { ConfigMap, Kind } from 'types/kubernetes/kubernetesTypes';
import { NamespaceNode } from 'ui/treeviews/nodes/namespaceNode';
import { TreeNode } from 'ui/treeviews/nodes/treeNode';
import { WgeContainerNode } from 'ui/treeviews/nodes/wge/wgeNodes';
import { TreeItemCollapsibleState } from 'vscode';
import { ApiState, KindApiParams } from '../cli/kubernetes/apiResources';

// a data store for each context defined in kubeconfig.
// view data is stored here.
// allows to safely switch contexts without laggy queries from previous context overwriting data in the global tree view
export class ContextData {
	public viewData: { [key: string]: ViewData; };
	public contextName = '';
	public apiState = ApiState.Loading;
	// Current cluster supported kubernetes resource kinds.
	public apiResources: Map<Kind, KindApiParams> | undefined;

	public portalUrl?: string;
	public wgeClusterName?: string;

	constructor(contextName: string) {
		this.contextName = contextName;
		this.viewData = {
			'source': new ViewData(),
			'workload': new ViewData(),
			'wge': new ViewData(),
		};
	}

}

const contextDatas = new Map<string, ContextData>();

export function currentContextData() {
	let currentData = contextDatas.get(kubeConfig.currentContext);
	if (!currentData) {
		currentData = new ContextData(kubeConfig.currentContext);
		contextDatas.set(kubeConfig.currentContext, currentData);
	}
	return currentData;
}

export class ViewData {
	public nodes: TreeNode[] = [];
	public collapsibleStates = new Map<string, TreeItemCollapsibleState>();
	public loading = false;


	get savedNodes() {
		let nodes: TreeNode[] = [];
		this.nodes.forEach(node => {
			nodes = nodes.concat(node.children);
		});
		return nodes.concat(this.nodes);
	}

	saveCollapsibleStates() {
		this.collapsibleStates.clear();

		for (const node of this.savedNodes) {
			const key = node.viewStateKey;
			if (key) {
				this.collapsibleStates.set(key, node.collapsibleState || TreeItemCollapsibleState.Collapsed);
			}
		}
	}

	loadCollapsibleStates() {
		for (const node of this.savedNodes) {
			const key = node.viewStateKey;
			if (key) {
				const state = this.collapsibleStates.get(key);
				if (state) {
					node.collapsibleState = state;
					if(node instanceof NamespaceNode) {
						const withIcons = !node.parent || node.parent instanceof WgeContainerNode;
						node.updateLabel(withIcons);
					}
				}
			}
		}
	}
}

export async function loadContextData() {
	const context = currentContextData();
	const config = await getResource('weave-gitops-interop', 'flux-system', Kind.ConfigMap) as ConfigMap;

	if(config) {
		context.portalUrl = config.data.portalUrl;
		context.wgeClusterName = config.data.wgeClusterName;
	}

	context.portalUrl ??= await wgeHelmReleasePortalUrl();
	context.wgeClusterName ??= kubeConfig.getCurrentCluster()?.name || kubeConfig.currentContext;
}

async function wgeHelmReleasePortalUrl() {
	const wgeHelmRelease = await getResource<HelmRelease>('weave-gitops-enterprise', 'flux-system', Kind.HelmRelease);
	if(!wgeHelmRelease) {
		return;
	}

	const values = wgeHelmRelease.spec?.values as any;
	const hosts = values?.ingress?.hosts;
	const host = hosts?.[0];

	if(host) {
		return `https://${host.host}`;
	}
}
