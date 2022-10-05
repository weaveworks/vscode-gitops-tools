import { ExtensionMode, MarkdownString } from 'vscode';
import { CommandId } from '../../commands';
import { globalState } from '../../extension';
import { getExtensionContext } from '../../extensionContext';
import { extensionState } from '../../extensionState';
import { KubernetesCluster, KubernetesContextWithCluster } from '../../kubernetes/types/kubernetesConfig';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { ClusterProvider } from '../../kubernetes/types/kubernetesTypes';
import { createMarkdownHr, createMarkdownTable } from '../../utils/markdownUtils';
import { ContextTypes, setVSCodeContext } from '../../vscodeContext';
import { NodeContext } from './nodeContext';
import { TreeNode } from './treeNode';

/**
 * Defines Cluster tree view item for displaying
 * kubernetes contexts inside the Clusters tree view.
 */
export class ClusterContextNode extends TreeNode {

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
	 * Cluster object.
	 */
	private cluster?: KubernetesCluster;

	/**
	 * Cluster context.
	 */
	private clusterContext: KubernetesContextWithCluster;

	/**
	 * Context name.
	 */
	contextName: string;

	/**
	 * Cluster name.
	 */
	clusterName: string;

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
	 * @param kubernetesContext Cluster object info.
	 */
	constructor(kubernetesContext: KubernetesContextWithCluster) {
		super(kubernetesContext.name);

		this.cluster = kubernetesContext.context.clusterInfo;
		this.clusterContext = kubernetesContext;
		this.clusterName = kubernetesContext.context.clusterInfo?.name || kubernetesContext.name;
		this.contextName = kubernetesContext.name;
		this.description = kubernetesContext.context.clusterInfo?.cluster.server;

		this.setIcon('cloud');
	}

	/**
	 * Set context/icon and refresh the node:
	 * - Whether or not GitOps is enabled
	 * - Cluster provider.
	 */
	async updateNodeContext() {
		this.isGitOpsEnabled = await kubernetesTools.isGitOpsEnabled(this.contextName);

		const clusterMetadata = globalState.getClusterMetadata(this.clusterName);
		if (clusterMetadata?.clusterProvider) {
			this.clusterProviderManuallyOverridden = true;
		}
		this.clusterProvider = clusterMetadata?.clusterProvider || await kubernetesTools.detectClusterProvider(this.contextName);

		// Update vscode context for welcome view of other tree views
		if (this.isCurrent && typeof this.isGitOpsEnabled === 'boolean') {
			setVSCodeContext(ContextTypes.CurrentClusterGitOpsNotEnabled, !this.isGitOpsEnabled);
		}

		if (this.isGitOpsEnabled) {
			this.setIcon('cloud-gitops');
		} else {
			this.setIcon('cloud');
		}
	}

	get tooltip(): MarkdownString {
		return this.getMarkdownHover(this.clusterContext);
	}

	/**
	 * Creates markdwon string for the Cluster tree view item tooltip.
	 * @param cluster Cluster info object.
	 */
	getMarkdownHover(cluster: KubernetesContextWithCluster): MarkdownString {
		const markdown: MarkdownString = createMarkdownTable(cluster);

		createMarkdownHr(markdown);
		markdown.appendMarkdown(`Flux Version: ${extensionState.get('fluxVersion')}`);

		if (this.clusterProvider !== ClusterProvider.Generic || this.clusterProviderManuallyOverridden) {
			createMarkdownHr(markdown);
			markdown.appendMarkdown(`Cluster Provider: ${this.clusterProvider}`);
			if (this.clusterProviderManuallyOverridden) {
				markdown.appendMarkdown(' <span title="Use context menu on the cluster `Set Cluster Provider` to change.">(User override)</span>');
			}
		}

		return markdown;
	}

	// @ts-ignore
	get command() {
		// Allow click to swith current kubernetes context only when developing extension
		if (getExtensionContext().extensionMode === ExtensionMode.Development) {
			return {
				command: CommandId.SetCurrentKubernetesContext,
				arguments: [this],
				title: 'Set Context',
			};
		}
	}

	get contexts() {
		const result = [NodeContext.Cluster];

		if (typeof this.isGitOpsEnabled === 'boolean') {
			result.push(
				this.isGitOpsEnabled ? NodeContext.ClusterGitOpsEnabled : NodeContext.ClusterGitOpsNotEnabled,
			);
		}

		result.push(
			this.isCurrent ? NodeContext.CurrentCluster : NodeContext.NotCurrentCluster,
		);

		return result;
	}

}
