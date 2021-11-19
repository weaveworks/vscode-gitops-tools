import { HelmRelease } from '../../kubernetes/helmRelease';
import { ApplicationNode } from './applicationNode';
import { NodeContext } from './nodeContext';
import { NodeLabels } from './nodeLabels';

/**
 * Defines Helm release tree view item for display in GitOps Applications tree view.
 */
export class HelmReleaseNode extends ApplicationNode {

	contextValue = NodeContext.HelmRelease;

	/**
	 * Helm release kubernetes resource object
	 */
	resource: HelmRelease;

	/**
	 * Creates new helm release tree view item for display.
	 * @param helmRelease Helm release kubernetes object info.
	 */
	constructor(helmRelease: HelmRelease) {
		super(helmRelease.metadata?.name || '', helmRelease);

		this.description = NodeLabels.HelmRelease;

		this.resource = helmRelease;

		this.makeCollapsible();

	}
}
