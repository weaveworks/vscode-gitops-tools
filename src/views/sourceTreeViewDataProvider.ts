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
					label: `Git: ${gitRepository.metadata.name}`,
					tooltip: mdHover,
				}));
			}
		}
		const helmRepositories = await kubernetesTools.getHelmRepositories();
		if (helmRepositories) {
			for (const helmRepository of helmRepositories.items) {
				const mdHover = new MarkdownString();
				mdHover.appendCodeblock(JSON.stringify(helmRepository.metadata, null, '  '), 'json');
				treeItems.push(new TreeViewItem({
					label: `Helm Repository: ${helmRepository.metadata.name}`,
					tooltip: mdHover,
				}));
			}
		}
		const buckets = await kubernetesTools.getBuckets();
		if (buckets) {
			for (const bucket of buckets.items) {
				const mdHover = new MarkdownString();
				mdHover.appendCodeblock(JSON.stringify(bucket.metadata, null, '  '), 'json');
				treeItems.push(new TreeViewItem({
					label: `Bucket: ${bucket.metadata.name}`,
					tooltip: mdHover,
				}));
			}
		}
    return treeItems;
  }
}
