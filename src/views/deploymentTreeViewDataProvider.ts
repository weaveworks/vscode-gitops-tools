import { MarkdownString } from 'vscode';
import { HelmReleaseItem } from '../kubernetes/kubernetesHelmRelease';
import { KustomizeItem } from '../kubernetes/kubernetesKustomize';
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
	constructor(kustomization: KustomizeItem) {
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
	constructor(helmRelease: HelmReleaseItem) {
		super({
			label: `Helm Release: ${helmRelease.metadata.name}`,
		});

		const mdHover = new MarkdownString();
		mdHover.appendCodeblock(JSON.stringify(helmRelease, null, '  '), 'json');
		this.tooltip = mdHover;

		this.contextValue = TreeViewItemContext.HelmRelease;
	}
}
