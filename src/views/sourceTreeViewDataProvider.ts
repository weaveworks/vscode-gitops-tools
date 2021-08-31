import { MarkdownString } from 'vscode';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';

export class SourceTreeViewDataProvider extends TreeViewDataProvider {
  async buildTree() {
		const treeItems: TreeViewItem[] = [];
		const gitRepositories = await kubernetesTools.getGitRepositories();
		if (gitRepositories) {
			for (const gitRepository of gitRepositories.items) {
				const mdHover = new MarkdownString();
				mdHover.appendCodeblock(JSON.stringify(gitRepository.metadata, null, '  '), 'json');
				treeItems.push(new TreeViewItem({
					label: `git: ${gitRepository.metadata.name}`,
					tooltip: mdHover,
				}));
			}
		}
		const helmRepositories = await kubernetesTools.getHelmRepositories();
		if (helmRepositories) {
			// TODO: implement me
		}
		const buckets = await kubernetesTools.getBuckets();
		if (buckets) {
			// TODO: implement me
		}
    return treeItems;
  }
}
