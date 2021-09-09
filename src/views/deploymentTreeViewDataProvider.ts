import { MarkdownString } from 'vscode';
import { HelmRelease } from '../kubernetes/helmRelease';
import { Kustomize } from '../kubernetes/kustomize';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';
import { TreeViewItemContext } from './views';

export class DeploymentTreeViewDataProvider extends TreeViewDataProvider {
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

		const mdHover = new MarkdownString();
		mdHover.appendCodeblock(JSON.stringify(kustomization, null, '  '), 'json');
		this.tooltip = mdHover;

		this.contextValue = TreeViewItemContext.Kustomization;
	}
}

class HelmReleaseTreeViewItem extends TreeViewItem {
	constructor(helmRelease: HelmRelease) {
		super({
			label: `Helm Release: ${helmRelease.metadata.name}`,
		});

		const mdHover = new MarkdownString();
		mdHover.appendCodeblock(JSON.stringify(helmRelease, null, '  '), 'json');
		this.tooltip = mdHover;

		this.contextValue = TreeViewItemContext.HelmRelease;
	}
}
