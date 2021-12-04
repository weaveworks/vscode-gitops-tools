import { MarkdownString, window } from 'vscode';
import { CommandId } from '../../commands';
import { ContextTypes, setContext } from '../../context';
import { extensionState } from '../../extensionState';
import { globalState } from '../../globalState';
import { Cluster } from '../../kubernetes/kubernetesConfig';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { ClusterProvider } from '../../kubernetes/kubernetesTypes';
import { createMarkdownHr, createMarkdownTable } from '../../utils/markdownUtils';
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
	 * User used "Set Cluster Provider" context menu item
	 * to override the cluster provider detection.
	 */
	private clusterProviderManuallyOverridden = false;

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
		this.isGitOpsEnabled = await kubernetesTools.isGitOpsEnabled(this.name);

		const clusterMetadata = globalState.getClusterMetadata(this.name);
		if (clusterMetadata?.clusterProvider) {
			this.clusterProviderManuallyOverridden = true;
		}
		this.clusterProvider = clusterMetadata?.clusterProvider || await kubernetesTools.detectClusterProvider(this.name);

		// Update vscode context for welcome view of other tree views
		if (this.isCurrent && typeof this.isGitOpsEnabled === 'boolean') {
			setContext(ContextTypes.CurrentClusterGitOpsNotEnabled, !this.isGitOpsEnabled);
		}

		if (this.isGitOpsEnabled) {
			this.setIcon('cloud-gitops');
		} else {
			this.setIcon('cloud');
		}
	}

	get tooltip(): MarkdownString {
		return this.getMarkdownHover(this.cluster);
	}

	/**
	 * Creates markdwon string for the Cluster tree view item tooltip.
	 * @param cluster Cluster info object.
	 */
	getMarkdownHover(cluster: Cluster): MarkdownString {
		const markdown: MarkdownString = createMarkdownTable(cluster);

		createMarkdownHr(markdown);
		markdown.appendMarkdown(`Flux Version: ${extensionState.get('fluxVersion')}`);

		if (this.clusterProvider !== ClusterProvider.Generic || this.clusterProviderManuallyOverridden) {
			createMarkdownHr(markdown);
			markdown.appendMarkdown(`Cluster Provider: ${this.clusterProvider || ClusterProvider.Unknown}`);
			if (this.clusterProviderManuallyOverridden) {
				markdown.appendMarkdown(' <span title="Use context menu on the cluster `Set Cluster Provider` to change.">(User override)</span>');
			}
		}

		return markdown;
	}

	/**
	 * Return this cluster provider.
	 */
	async getClusterProvider() {

		if (this.clusterProvider === ClusterProvider.Unknown) {
			this.clusterProvider = await kubernetesTools.detectClusterProvider(this.name);
		}

		if (this.clusterProvider === ClusterProvider.Unknown) {
			window.showErrorMessage('Cluster provider detection failed.');
		}

		return this.clusterProvider;
	}

	get contexts() {
		const result = [NodeContext.Cluster];

		if (typeof this.isGitOpsEnabled === 'boolean') {
			result.push(
				this.isGitOpsEnabled ? NodeContext.ClusterGitOpsEnabled : NodeContext.ClusterGitOpsNotEnabled,
			);
		}

		return result;
	}

}
