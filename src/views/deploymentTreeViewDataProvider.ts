import { ExtensionContext, ExtensionMode } from 'vscode';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { HelmRelease } from '../kubernetes/helmRelease';
import { Kustomize } from '../kubernetes/kustomize';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';
import { TreeViewItemContext } from './treeViewItemContext';
import { TreeViewItemLabels } from './treeViewItemLabels';
import { DeploymentTreeViewItem } from './deploymentTreeViewItem';

let _extensionContext: ExtensionContext;

export class DeploymentTreeViewDataProvider extends TreeViewDataProvider {
	constructor(extensionContext: ExtensionContext) {
		super();
		_extensionContext = extensionContext;
	}

  async buildTree() {
		const treeItems: TreeViewItem[] = [];
    const kustomizations = await kubernetesTools.getKustomizations();
    if (kustomizations) {
			for (const kustomizeDeployment of kustomizations.items) {
				treeItems.push(new KustomizationTreeViewItem(kustomizeDeployment));
			}
    }
		const helmReleases = await kubernetesTools.getHelmReleases();
		if (helmReleases) {
			for (const helmRelease of helmReleases.items) {
				treeItems.push(new HelmReleaseTreeViewItem(helmRelease));
			}
		}
    return treeItems;
  }
}

class KustomizationTreeViewItem extends DeploymentTreeViewItem {
	constructor(kustomization: Kustomize) {
		super({
			label: `${TreeViewItemLabels.Kustomization}: ${kustomization.metadata.name}`,
		});
		this.contextValue = TreeViewItemContext.Kustomization;
		this.tooltip = this.getMarkdown(kustomization); //, _extensionContext.extensionMode === ExtensionMode.Development);
	}
}

class HelmReleaseTreeViewItem extends DeploymentTreeViewItem {
	constructor(helmRelease: HelmRelease) {
		super({
			label: `${TreeViewItemLabels.HelmRelease}: ${helmRelease.metadata.name}`,
		});
		this.contextValue = TreeViewItemContext.HelmRelease;
		this.tooltip = this.getMarkdown(helmRelease); //, _extensionContext.extensionMode === ExtensionMode.Development);
	}
}
