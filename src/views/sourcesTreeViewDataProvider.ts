import { MarkdownString } from 'vscode';
import { kubectlBucket, kubectlGitRepository, kubectlHelmRepository } from '../kubernetes/kubernetesTools';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';

export class SourcesTreeViewDataProvider extends TreeViewDataProvider {
  async buildTree() {
		const treeItems: TreeViewItem[] = [];
		const gitRepositories = await kubectlGitRepository();
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
		const helmRepositories = await kubectlHelmRepository();
		if (helmRepositories) {
			// TODO: implement me
		}
		const buckets = await kubectlBucket();
		if (buckets) {
			// TODO: implement me
		}
    return treeItems;
  }
}
