import * as k8s from '@kubernetes/client-node';
import { ExtensionMode, MarkdownString } from 'vscode';


import { fluxVersion } from 'cli/checkVersions';
import { fluxTools } from 'cli/flux/fluxTools';
import { ApiState } from 'cli/kubernetes/apiResources';
import { detectClusterProvider } from 'cli/kubernetes/clusterProvider';
import { getFluxControllers } from 'cli/kubernetes/kubectlGet';
import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { currentContextData } from 'data/contextData';
import { extensionContext, globalState, setVSCodeContext } from 'extension';
import { CommandId, ContextId } from 'types/extensionIds';
import { ClusterProvider } from 'types/kubernetes/clusterProvider';
import { NodeContext } from 'types/nodeContext';
import { clusterDataProvider, revealClusterNode } from 'ui/treeviews/treeViews';
import { InfoLabel } from 'utils/makeTreeviewInfoNode';
import { createContextMarkdownTable, createMarkdownHr } from 'utils/markdownUtils';
import { ClusterDeploymentNode } from './clusterDeploymentNode';
import { ClusterTreeNode } from './clusterTreeNode';

/**
 * Defines Cluster context tree view item for displaying
 * kubernetes contexts inside the Clusters tree view.
 */
export class ClusterNode extends ClusterTreeNode {

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
	async updateNodeChildren() {
		this.updateControllersNodes();

		// set cluster provider
		const clusterMetadata = globalState.getClusterMetadata(this.cluster?.name || this.context.name);
		if (clusterMetadata?.clusterProvider) {
			this.clusterProviderManuallyOverridden = true;
		}
		this.clusterProvider = clusterMetadata?.clusterProvider || await detectClusterProvider(this.context.name);

		// Update vscode context for welcome view of other tree views
		if (this.isCurrent && typeof this.isGitOpsEnabled === 'boolean') {
			setVSCodeContext(ContextId.CurrentClusterGitOpsNotEnabled, !this.isGitOpsEnabled);
		}

		// icon
		if (this.isGitOpsEnabled) {
			this.setIcon('cloud-gitops');
		} else {
			this.setIcon('cloud');
		}

		clusterDataProvider.redraw();
		this.updateControllersStatus();
	}

	private async updateControllersNodes() {
		const contextData = currentContextData();
		if(contextData.contextName !== this.context.name) {
			return;
		}

		if(contextData.apiState === ApiState.ClusterUnreachable) {
			this.children = this.infoNodes(InfoLabel.ClusterUnreachable);
			return;
		}
		if(contextData.apiState === ApiState.Loading) {
			this.children = this.infoNodes(InfoLabel.LoadingApi);
			return;
		}

		const fluxControllers = await getFluxControllers(this.context.name);
		this.isGitOpsEnabled = fluxControllers.length !== 0;

		this.children = [];
		if (this.isGitOpsEnabled) {
			revealClusterNode(this, {
				expand: false,
			});
			for (const deployment of fluxControllers) {
				this.addChild(new ClusterDeploymentNode(deployment));
			}
		} else {
			const notFound = new ClusterTreeNode('Flux controllers not found');
			notFound.setIcon('warning');
			this.addChild(notFound);
		}
	}

	/**
	 * Update deployment status for flux controllers.
	 * Get status from running flux commands instead of kubectl.
	 */
	private async updateControllersStatus() {
		const contextData = currentContextData();
		if(contextData.contextName !== this.context.name) {
			return;
		}

		if (this.children.length === 0 || contextData.apiState === ApiState.ClusterUnreachable) {
			return;
		}
		const fluxCheckResult = await fluxTools.check(this.context.name);
		if (!fluxCheckResult) {
			return;
		}

		const deploymentNodes: ClusterDeploymentNode[]  = this.children.filter(node => node instanceof ClusterDeploymentNode) as ClusterDeploymentNode[];
		// Match controllers fetched with flux with controllers
		// fetched with kubectl and update tree nodes.
		for (const clusterController of deploymentNodes) {
			for (const controller of fluxCheckResult.controllers) {
				const clusterControllerName = clusterController.resource.metadata.name?.trim();
				const deploymentName = controller.name.trim();

				if (clusterControllerName === deploymentName) {
					clusterController.description = controller.status;
					if (controller.success) {
						clusterController.setStatus('success');
					} else {
						clusterController.setStatus('failure');
					}
				}
			}
			clusterDataProvider.redraw(this);
		}
	}


	get isCurrent(): boolean {
		return this.context.name === kubeConfig.getCurrentContext();
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
		const cs = [];

		if (typeof this.isGitOpsEnabled === 'boolean') {
			cs.push(
				this.isGitOpsEnabled ? NodeContext.ClusterGitOpsEnabled : NodeContext.ClusterGitOpsNotEnabled,
			);
		}

		cs.push(
			this.isCurrent ? NodeContext.CurrentCluster : NodeContext.NotCurrentCluster,
		);

		cs.push(NodeContext.Cluster);

		return cs;
	}

}
