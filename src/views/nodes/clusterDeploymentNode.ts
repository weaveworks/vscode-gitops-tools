import { ThemeColor, ThemeIcon } from 'vscode';
import { Deployment } from '../../kubernetes/kubernetesTypes';
import { NodeContext } from './nodeContext';
import { TreeNode } from './treeNode';

/**
 * Defines deployment tree view item for display in GitOps Clusters tree view.
 */
export class ClusterDeploymentNode extends TreeNode {

	contextValue = NodeContext.Deployment;

	/**
	 * Cluster deployment kubernetes resource object
	 */
	resource: Deployment;

	constructor(deployment: Deployment) {
		super(deployment.metadata.name || '');

		this.resource = deployment;

		this.label = this.getImageName(deployment);

		this.setIcon(new ThemeIcon('circle-large-outline'));
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
			this.setIcon(new ThemeIcon('pass', new ThemeColor('terminal.ansiGreen')));
		} else if (status === 'failure') {
			this.setIcon(new ThemeIcon('warning', new ThemeColor('editorWarning.foreground')));
		}
	}
}

