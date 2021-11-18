import { MarkdownString, window } from 'vscode';
import { CommandId } from '../../commands';
import { NotificationMessages } from '../../constants';
import { ContextTypes, setContext } from '../../context';
import { extensionState } from '../../extensionState';
import { Cluster } from '../../kubernetes/kubernetesConfig';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { ClusterProvider } from '../../kubernetes/kubernetesTypes';
import { createMarkdownTable } from '../../utils/markdownUtils';
import { NodeContext } from './nodeContext';
import { TreeNode } from './treeNode';

/**
 * Defines Cluster tree view item for displaying
 * configured kubernetes clusters in GitOps Clusters tree view.
 */
export class ClusterNode extends TreeNode {

	/**
	 * Whether cluster is managed by AKS or Azure ARC
	 * or some other provider.
	 */
	private clusterProvider: ClusterProvider = ClusterProvider.Unknown;

	/**
	 * Saved cluster object.
	 */
	cluster: Cluster;

	/**
	 * Cluster name.
	 */
	name: string;

	/**
	 * Current/active cluster/context.
	 */
	isCurrent = false;

	/**
	 * Whether or not gitops is installed on this cluster.
	 * `undefined` when it's not yet initialized or when detection failed.
	 */
	isGitOpsEnabled?: boolean;

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
	}

	// @ts-ignore
	get command() {
		// set current context command to change selected cluster
		return {
			command: CommandId.SetCurrentKubernetesContext,
			arguments: [this.name],
			title: 'Set current context',
		};
	}

	/**
	 * Set context/icon and refresh the node:
	 * - Whether or not GitOps is enabled
	 * - Cluster provider.
	 */
	async updateNodeContext() {
		this.isGitOpsEnabled = await kubernetesTools.isFluxInstalled(this.name);
		await this.detectClusterProvider();

		// Update vscode context for welcome view of other tree views
		if (this.isCurrent && typeof this.isGitOpsEnabled === 'boolean') {
			setContext(ContextTypes.CurrentClusterFluxNotInstalled, !this.isGitOpsEnabled);
		}

		if (this.isGitOpsEnabled) {
			this.setIcon('cloud-gitops');
		} else {
			this.setIcon('cloud');
		}
	}

	/**
	 * Try to detect cluster provider.
	 */
	private async detectClusterProvider() {
		this.clusterProvider = await kubernetesTools.detectClusterProvider(this.name);
	}

	// @ts-ignore
	get tooltip(): MarkdownString {
		return this.getMarkdownHover(this.cluster);
	}

	/**
	 * Creates markdwon string for the Cluster tree view item tooltip.
	 * @param cluster Cluster info object.
	 */
	getMarkdownHover(cluster: Cluster): MarkdownString {
		const markdown: MarkdownString = createMarkdownTable(cluster);

		markdown.appendMarkdown('\n\n---\n\n');
		markdown.appendMarkdown(`Flux Version: ${extensionState.get('fluxVersion')}`);

		if (this.clusterProvider !== ClusterProvider.Generic) {
			markdown.appendMarkdown('\n\n---\n\n');
			markdown.appendMarkdown(`Cluster Provider: ${this.clusterProvider || ClusterProvider.Unknown}`);
		}

		return markdown;
	}

	// @ts-ignore
	get contextValue(): string {
		let gitOpsEnabledContext = '';
		if (typeof this.isGitOpsEnabled === 'boolean') {
			gitOpsEnabledContext = this.isGitOpsEnabled ? NodeContext.ClusterGitOpsEnabled : NodeContext.ClusterGitOpsNotEnabled;
		}

		return this.joinContexts(NodeContext.Cluster, gitOpsEnabledContext);
	}

	/**
	 * Return this cluster provider.
	 */
	async getClusterProvider() {

		if (this.clusterProvider === ClusterProvider.Unknown) {
			await this.detectClusterProvider();
		}

		if (this.clusterProvider === ClusterProvider.Unknown) {
			window.showErrorMessage(NotificationMessages.ClusterProviderDetectionFailed);
		}

		return this.clusterProvider;
	}

}
