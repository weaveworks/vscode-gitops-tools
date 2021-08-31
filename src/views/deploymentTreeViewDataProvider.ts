import { MarkdownString } from 'vscode';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';

export class DeploymentTreeViewDataProvider extends TreeViewDataProvider {
  async buildTree() {
		const treeItems: TreeViewItem[] = [];
    const kustomizations = await kubernetesTools.getKustomizations();
    if (kustomizations) {
			for (const kustomizeDeployment of kustomizations.items) {
				const mdHover = new MarkdownString();
				mdHover.appendCodeblock(JSON.stringify(kustomizeDeployment.metadata, null, '  '), 'json');
				treeItems.push(new TreeViewItem({
					label: `Kustomization: ${kustomizeDeployment.metadata.name}`,
					tooltip: mdHover
				}));
			}
    }
		const helmReleases = await kubernetesTools.getHelmReleases();
		if (helmReleases) {
			for (const helmRelease of helmReleases.items) {
				const mdHover = new MarkdownString();
				mdHover.appendCodeblock(JSON.stringify(helmRelease.metadata, null, '  '), 'json');
				treeItems.push(new TreeViewItem({
					label: `Helm Release: ${helmRelease.metadata.name}`,
					tooltip: mdHover
				}));
			}
		}
    return treeItems;
  }
}
