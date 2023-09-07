import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { TreeNode } from 'ui/treeviews/nodes/treeNode';
import { TreeItemCollapsibleState } from 'vscode';
import { ApiState, KindApiParams } from '../cli/kubernetes/apiResources';


export class ContextData {
	public viewData: { [key: string]: ViewData; };
	public contextName = '';
	public apiState = ApiState.Loading;
	// Current cluster supported kubernetes resource kinds.
	public apiResources: Map<Kind, KindApiParams> | undefined;

	constructor(contextName: string) {
		this.contextName = contextName;
		this.viewData = {
			'source': new ViewData(),
			'workload': new ViewData(),
			'template': new ViewData(),
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
