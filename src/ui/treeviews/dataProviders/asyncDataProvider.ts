import { ApiState } from 'cli/kubernetes/apiResources';
import { KubeConfigState, kubeConfigState } from 'cli/kubernetes/kubernetesConfig';
import { ContextData, ViewData, currentContextData } from 'data/contextData';
import { InfoNode, infoNodes } from 'utils/makeTreeviewInfoNode';
import { NamespaceNode } from '../nodes/namespaceNode';
import { TreeNode } from '../nodes/treeNode';
import { clusterDataProvider } from '../treeViews';
import { SimpleDataProvider } from './simpleDataProvider';

/**`
 * Defines tree view data provider base class for all GitOps tree views.
 */
export class AsyncDataProvider extends SimpleDataProvider {
	get nodes() {
		return this.viewData(currentContextData()).nodes;
	}

	// child views override this to provide their own view data
	protected viewData(contextData: ContextData) {
		return new ViewData();
	}

	public currentViewData() {
		return this.viewData(currentContextData());
	}


	// give nodes for vscode to render based on async data loading state
	protected async getRootNodes(): Promise<TreeNode[]> {
		const context = currentContextData();

		if(context.apiState === ApiState.Loading) {
			return infoNodes(InfoNode.LoadingApi);
		}

		if(context.apiState === ApiState.ClusterUnreachable) {
			return infoNodes(InfoNode.ClusterUnreachable);
		}

		// return empty array so that vscode welcome view with embedded link "Enable Gitops ..." is shown
		if(clusterDataProvider.currentContextIsGitOpsNotEnabled()) {
			return [];
		}

		if (this.currentViewData().loading || kubeConfigState === KubeConfigState.Loading) {
			return infoNodes(InfoNode.Loading);
		}

		if(this.currentViewData().nodes.length === 0) {
			return infoNodes(InfoNode.NoResources);
		}

		return this.currentViewData().nodes;
	}


	public async reload() {
		const context = currentContextData();
		const viewData = this.viewData(context);


		if(viewData.loading) {
			return;
		}

		viewData.loading = true;
		viewData.saveCollapsibleStates();
		if(viewData.nodes.length === 0) {
			// show Loading... if no nodes yet
			this.redraw();
		}
		viewData.nodes = []; // clear them first for good luck
		viewData.nodes = await this.loadRootNodes();
		viewData.loadCollapsibleStates();
		viewData.loading = false;

		this.nodes.forEach(node => {
			if(node instanceof NamespaceNode) {
				node.updateLabel();
			}
		});
		this.redraw();
	}
}
