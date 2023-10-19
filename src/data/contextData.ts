import { getResource } from 'cli/kubernetes/kubectlGet';
import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { HelmRelease } from 'types/flux/helmRelease';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { TreeNode } from 'ui/treeviews/nodes/treeNode';
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

	public wgePortalUrl?: string;

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

	saveCollapsibleStates() {
		this.collapsibleStates.clear();

		for (const node of this.nodes) {
			const name = node.resource?.metadata?.name;
			if (name) {
				this.collapsibleStates.set(name, node.collapsibleState || TreeItemCollapsibleState.Collapsed);
			}
		}
	}

	loadCollapsibleStates() {
		for (const node of this.nodes) {
			const name = node.resource?.metadata?.name;
			if (name) {
				const state = this.collapsibleStates.get(name);
				if (state) {
					node.collapsibleState = state;
				}
			}
		}
	}
}

export async function loadContextData() {
	const context = currentContextData();

	const wgeHelmRelease = await getResource<HelmRelease>('weave-gitops-enterprise', 'flux-system', Kind.HelmRelease);
	if(!wgeHelmRelease) {
		context.wgePortalUrl = undefined;
		return;
	}

	const values = wgeHelmRelease.spec?.values as any;
	const hosts = values?.ingress?.hosts;
	const host = hosts?.[0];

	context.wgePortalUrl = host;
}
