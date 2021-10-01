import { MarkdownString } from 'vscode';
import { KubectlCommands } from '../../commands';
import { ContextTypes, setContext } from '../../context';
import { Cluster } from '../../kubernetes/kubernetesConfig';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { createMarkdownTable } from '../../utils/stringUtils';
import { NodeContext } from './nodeContext';
import { TreeNode } from './treeNode';

/**
 * Defines Cluster tree view item for displaying
 * configured kubernetes clusters in GitOps Clusters tree view.
 */
export class ClusterNode extends TreeNode {

	/**
	 * Cluster name
	 */
	name: string;

	/**
	 * Current/active cluster.
	 */
	isCurrent: boolean = false;

	/**
	 * Whether or not flux is installed on this cluster
	 */
	isFlux: boolean = false;

	/**
	 * Creates new Cluster tree view item for display.
	 * @param cluster Cluster object info.
	 */
	constructor(cluster: Cluster) {
		super(cluster.name);

		this.name = cluster.name;
		this.description = cluster.cluster.server;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(cluster);

		this.setIcon('cloud');

		// set current context command to change selected cluster
		this.command = {
			command: KubectlCommands.SetCurrentContext,
			arguments: [this.name],
			title: 'Set current context',
		};
	}

	/**
	 * Set context for active cluster (whether or not flux enabled)
	 */
	async setContext() {
		this.isFlux = (await kubernetesTools.isFluxInstalled(this.name)) || false;

		// Update vscode context for welcome view of other tree views
		if (this.isCurrent) {
			setContext(ContextTypes.CurrentClusterFluxNotInstalled, !this.isFlux);
		}

		if (this.isFlux) {
			this.contextValue = NodeContext.ClusterFlux;
			this.setIcon('cloud-gitops');
		} else {
			this.contextValue = NodeContext.Cluster;
		}
	}

	/**
	 * Creates markdwon string for the Cluster tree view item tooltip.
	 * @param cluster Cluster info object.
	 * @returns Markdown string to use for Cluster tree view item tooltip.
	 */
	getMarkdown(cluster: Cluster): MarkdownString {
		return createMarkdownTable(cluster);
	}

}
