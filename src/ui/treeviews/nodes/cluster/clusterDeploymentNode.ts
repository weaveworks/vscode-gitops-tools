import { Deployment, Kind } from 'types/kubernetes/kubernetesTypes';
import { TreeNode, TreeNodeIcon } from '../treeNode';

/**
 * Defines deployment tree view item for display in GitOps Clusters tree view.
 */
export class ClusterDeploymentNode extends TreeNode {

	/**
	 * Cluster deployment kubernetes resource object
	 */
	resource: Deployment;

	constructor(deployment: Deployment) {
		super(deployment.metadata.name || '');

		this.resource = deployment;

		this.label = this.getImageName(deployment);

		this.setIcon(TreeNodeIcon.Unknown);
	}

	/**
	 * Return the name of the image of the container
	 * @param deployment Flux deployment kubernetes object
	 * @returns Version of the flux controller or an empty string
	 */
	getImageName(deployment: Deployment): string {
		const fluxControllerContainer = deployment.spec.template.spec?.containers?.find(container => container || '');
		return fluxControllerContainer?.image || '';
	}

	/**
	 * Show status of deployment by changing the icon.
	 * @param status Status of this deployment.
	 */
	setStatus(status: 'success' | 'failure') {
		if (status === 'success') {
			this.setIcon(TreeNodeIcon.Success);
		} else if (status === 'failure') {
			this.setIcon(TreeNodeIcon.Warning);
		}
	}

	get contexts() {
		return [Kind.Deployment];
	}
}

