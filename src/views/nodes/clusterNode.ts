import { MarkdownString } from 'vscode';
import { CommandId } from '../../commands';
import { ContextTypes, setContext } from '../../context';
import { extensionState } from '../../extensionState';
import { Cluster } from '../../kubernetes/kubernetesConfig';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { ClusterProvider } from '../../kubernetes/kubernetesTypes';
import { createMarkdownTable } from '../../utils/stringUtils';
import { refreshClusterTreeView } from '../treeViews';
import { NodeContext } from './nodeContext';
import { TreeNode } from './treeNode';

/**
 * Defines Cluster tree view item for displaying
 * configured kubernetes clusters in GitOps Clusters tree view.
 */
export class ClusterNode extends TreeNode {

	/**
	 * Saved cluster object.
	 */
	cluster: Cluster;

	/**
	 * Cluster name
	 */
	name: string;

	/**
	 * Whether cluster is Azure (AKS) or other type.
	 */
	clusterProvider?: ClusterProvider;

	/**
	 * Current/active cluster.
	 */
	isCurrent: boolean = false;

	/**
	 * Whether or not gitops is installed on this cluster
	 */
	isGitOpsInstalled: boolean = false;

	/**
	 * Creates new Cluster tree view item for display.
	 * @param cluster Cluster object info.
	 */
	constructor(cluster: Cluster) {
		super(cluster.name);

		this.cluster = cluster;
		this.name = cluster.name;
		this.description = cluster.cluster.server;

		this.setIcon('cloud');

		// set current context command to change selected cluster
		this.command = {
			command: CommandId.SetCurrentKubernetesContext,
			arguments: [this.name],
			title: 'Set current context',
		};

		// don't wait, update async
		this.updateNodeContext();
	}

	/**
	 * Set context/icon and refresh the node:
	 * - Whether or not GitOps is enabled
	 * - Cluster type (AKS or not AKS)
	 */
	async updateNodeContext() {
		this.isGitOpsInstalled = (await kubernetesTools.isFluxInstalled(this.name)) || false;
		this.clusterProvider = await kubernetesTools.detectClusterProvider(this.name);

		// Update vscode context for welcome view of other tree views
		if (this.isCurrent) {
			setContext(ContextTypes.CurrentClusterFluxNotInstalled, !this.isGitOpsInstalled);
		}

		if (this.isGitOpsInstalled) {
			this.setIcon('cloud-gitops');
		} else {
			this.setIcon('cloud');
		}

		refreshClusterTreeView(this);
	}

	/**
	 * Creates markdwon string for the Cluster tree view item tooltip.
	 * @param cluster Cluster info object.
	 * @returns Markdown string to use for Cluster tree view item tooltip.
	 */
	getMarkdown(cluster: Cluster): MarkdownString {
		const markdown: MarkdownString = createMarkdownTable(cluster);

		markdown.appendMarkdown('\n\n---\n\n');
		markdown.appendMarkdown(`Flux Version: ${extensionState.get('fluxVersion')}`);

		if (this.clusterProvider !== ClusterProvider.Generic) {
			markdown.appendMarkdown('\n\n---\n\n');
			markdown.appendMarkdown(`Cluster Provider: ${this.clusterProvider === ClusterProvider.AKS ? 'AKS' : 'Unknown'}`);
		}

		return markdown;
	}

	// @ts-ignore
	get contextValue(): string {
		return `cluster;${this.isGitOpsInstalled ? NodeContext.ClusterGitOpsInstalled : NodeContext.ClusterGitOpsNotInstalled};${this.clusterProvider === ClusterProvider.AKS ? NodeContext.ClusterProviderAKS : NodeContext.ClusterProviderGeneric};`;
	}

	// @ts-ignore
	get tooltip(): MarkdownString {
		return this.getMarkdown(this.cluster);
	}

}
