import { ExtensionContext, ExtensionMode, MarkdownString } from 'vscode';
import { HelmRelease } from '../kubernetes/helmRelease';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { Kustomize } from '../kubernetes/kustomize';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';
import { generateDeploymentHover } from './treeViewItemHover';
import { TreeViewItemContext } from './views';

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

class KustomizationTreeViewItem extends TreeViewItem {
	constructor(kustomization: Kustomize) {
		super({
			label: `Kustomization: ${kustomization.metadata.name}`,
		});

		this.tooltip = generateDeploymentHover(kustomization, _extensionContext.extensionMode === ExtensionMode.Development);

		this.contextValue = TreeViewItemContext.Kustomization;
	}
}

class HelmReleaseTreeViewItem extends TreeViewItem {
	constructor(helmRelease: HelmRelease) {
		super({
			label: `Helm Release: ${helmRelease.metadata.name}`,
		});

		this.tooltip = generateDeploymentHover(helmRelease, _extensionContext.extensionMode === ExtensionMode.Development);

		this.contextValue = TreeViewItemContext.HelmRelease;
	}
}
