import {
	MarkdownString,
	ThemeColor,
	ThemeIcon
} from 'vscode';
import { KubectlCommands } from '../commands';
import { FileTypes } from '../fileTypes';
import { Cluster } from '../kubernetes/kubernetesConfig';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { ResourceTypes } from '../kubernetes/kubernetesTypes';
import { TreeNode } from './treeNode';
import { NodeContext } from './nodeContext';
import { createMarkdownTable } from '../utils/stringUtils';

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
	 * Whether or not flux is installed on this cluster
	 */
	isFlux: boolean = false;

	/**
	 * Creates new Cluster tree view item for display.
	 * @param cluster Cluster object info.
	 */
	constructor(cluster: Cluster) {
		super({
			label: cluster.name,
			description: cluster.cluster.server,
		});

		this.name = cluster.name;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(cluster);

		// set resource Uri to open cluster config in editor
		this.resourceUri = kubernetesTools.getResourceUri(
			cluster.name,
			`${ResourceTypes.Namespace}/${cluster.name}`,
			FileTypes.Yaml);

		this.setIcon(new ThemeIcon('cloud'));

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
		if (this.isFlux) {
			this.contextValue = NodeContext.ClusterFlux;
			this.setIcon(new ThemeIcon('pass-filled', new ThemeColor('terminal.ansiGreen')));
		} else {
			this.contextValue = NodeContext.Cluster;
		}
	}

	/**
	 * Creates markdwon string for the Cluster tree view item tooltip.
	 * @param cluster Cluster info object.
	 * @param showJsonConfig Optional show Json config flag for dev debug.
	 * @returns Markdown string to use for Cluster tree view item tooltip.
	 */
	getMarkdown(cluster: Cluster,	showJsonConfig: boolean = false): MarkdownString {

		const markdown: MarkdownString = createMarkdownTable(cluster);

		if (showJsonConfig) {
			markdown.appendCodeblock(JSON.stringify(cluster, null, '  '), 'json');
		}

		return markdown;
	}

}
