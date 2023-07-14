import * as k8s from '@kubernetes/client-node';
import { ExtensionMode, MarkdownString } from 'vscode';


import { fluxVersion } from 'cli/checkVersions';
import { detectClusterProvider, isGitOpsEnabled } from 'cli/kubernetes/clusterProvider';
import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { extensionContext, globalState, setVSCodeContext } from 'extension';
import { result } from 'types/errorable';
import { CommandId, ContextId } from 'types/extensionIds';
import { ClusterProvider } from 'types/kubernetes/clusterProvider';
import { NodeContext } from 'types/nodeContext';
import { createContextMarkdownTable, createMarkdownHr } from 'utils/markdownUtils';
import { TreeNode } from '../treeNode';

/**
 * Defines Cluster context tree view item for displaying
 * kubernetes contexts inside the Clusters tree view.
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
	 * Cluster object.
	 */
	public cluster?: k8s.Cluster;

	/**
	 * Cluster context.
	 */
	public context: k8s.Context;

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
	constructor(context: k8s.Context) {
		super(context.name);

		this.cluster = kubeConfig.getCluster(context.cluster) || undefined;
		this.context = context;
		this.description = this.cluster?.server;

		this.setIcon('cloud');
	}

	/**
	 * Set context/icon and refresh the node:
	 * - Whether or not GitOps is enabled
	 * - Cluster provider.
	 */
	async updateNodeContext() {
		this.isGitOpsEnabled = await isGitOpsEnabled(this.context.name);

		const clusterMetadata = globalState.getClusterMetadata(this.cluster?.name || this.context.name);
		if (clusterMetadata?.clusterProvider) {
			this.clusterProviderManuallyOverridden = true;
		}
		this.clusterProvider = clusterMetadata?.clusterProvider || await detectClusterProvider(this.context.name);

		// Update vscode context for welcome view of other tree views
		if (this.isCurrent && typeof this.isGitOpsEnabled === 'boolean') {
			setVSCodeContext(ContextId.CurrentClusterGitOpsNotEnabled, !this.isGitOpsEnabled);
		}

		if (this.isGitOpsEnabled) {
			this.setIcon('cloud-gitops');
		} else {
			this.setIcon('cloud');
		}
	}

	get tooltip(): MarkdownString {
		return this.getMarkdownHover();
	}

	/**
	 * Creates markdwon string for the Cluster tree view item tooltip.
	 */
	getMarkdownHover(): MarkdownString {
		const markdown: MarkdownString = createContextMarkdownTable(this.context, this.cluster);

		createMarkdownHr(markdown);
		if(this.context.name === kubeConfig.getCurrentContext()) {
			markdown.appendMarkdown(`Flux Version: ${fluxVersion}`);
		}

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
		if (extensionContext.extensionMode === ExtensionMode.Development) {
			return {
				command: CommandId.SetCurrentKubernetesContext,
				arguments: [this],
				title: 'Set Context',
			};
		}
	}

	get contexts() {
		const cs = [NodeContext.Cluster];

		if (typeof this.isGitOpsEnabled === 'boolean') {
			cs.push(
				this.isGitOpsEnabled ? NodeContext.ClusterGitOpsEnabled : NodeContext.ClusterGitOpsNotEnabled,
			);
		}

		cs.push(
			this.isCurrent ? NodeContext.CurrentCluster : NodeContext.NotCurrentCluster,
		);

		return cs;
	}

}
