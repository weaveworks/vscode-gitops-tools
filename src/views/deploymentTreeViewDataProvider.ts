import { ExtensionContext, ExtensionMode } from 'vscode';
import { FileTypes } from '../fileTypes';
import { EditorCommands } from '../commands';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { HelmRelease } from '../kubernetes/helmRelease';
import { Kustomize } from '../kubernetes/kustomize';
import { ResourceTypes } from '../kubernetes/kubernetesTypes';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItemContext } from './treeViewItemContext';
import { TreeViewItemLabels } from './treeViewItemLabels';
import { DeploymentTreeViewItem } from './deploymentTreeViewItem';

let _extensionContext: ExtensionContext;

/**
 * Defines Deployments data provider for loading Kustomizations
 * and Helm Releases in GitOps Depoloyments tree view.
 */
export class DeploymentTreeViewDataProvider extends TreeViewDataProvider {
	constructor(extensionContext: ExtensionContext) {
		super();
		_extensionContext = extensionContext;
	}

	/**
   * Creates Deployment tree view items for the currently selected kubernetes cluster.
   * @returns Deployment tree view items to display.
   */
  async buildTree(): Promise<DeploymentTreeViewItem[]> {
		const treeItems: DeploymentTreeViewItem[] = [];

		// load deployment kustomizations
    const kustomizations = await kubernetesTools.getKustomizations();
    if (kustomizations) {
			for (const kustomizeDeployment of kustomizations.items) {
				treeItems.push(new KustomizationTreeViewItem(kustomizeDeployment));
			}
    }

		// load deployment helm releases
		const helmReleases = await kubernetesTools.getHelmReleases();
		if (helmReleases) {
			for (const helmRelease of helmReleases.items) {
				treeItems.push(new HelmReleaseTreeViewItem(helmRelease));
			}
		}
    return treeItems;
  }
}

/**
 * Defines Kustomization tree view item for display in GitOps Depoyments tree view.
 */
class KustomizationTreeViewItem extends DeploymentTreeViewItem {
	constructor(kustomization: Kustomize) {
		super({
			label: `${TreeViewItemLabels.Kustomization}: ${kustomization.metadata?.name}`,
		});

		this.contextValue = TreeViewItemContext.Kustomization;

		this.tooltip = this.getMarkdown(kustomization); //, _extensionContext.extensionMode === ExtensionMode.Development);

		// TODO: get and use current namespace from current context
		this.resourceUri = kubernetesTools.getResourceUri(null, // namespace
			`${ResourceTypes.Kustomization}/${kustomization.metadata?.name}`,
			FileTypes.Yaml);

		this.command = {
			command: EditorCommands.OpenResource,
			arguments: [this.resourceUri],
			title: 'View Resource',
		};
	}
}

/**
 * Defines Helm release tree view item for display in GitOps Deployments tree view.
 */
class HelmReleaseTreeViewItem extends DeploymentTreeViewItem {
	constructor(helmRelease: HelmRelease) {
		super({
			label: `${TreeViewItemLabels.HelmRelease}: ${helmRelease.metadata.name}`,
		});
		this.contextValue = TreeViewItemContext.HelmRelease;
		this.tooltip = this.getMarkdown(helmRelease); //, _extensionContext.extensionMode === ExtensionMode.Development);
	}
}
