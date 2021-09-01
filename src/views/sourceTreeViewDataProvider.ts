import { MarkdownString } from 'vscode';
import { BucketItem, GitRepositoryItem, HelmRepositoryItem, kubernetesTools } from '../kubernetes/kubernetesTools';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';
import { TreeViewItemContext } from './views';

export class SourceTreeViewDataProvider extends TreeViewDataProvider {
  async buildTree() {
		const treeItems: TreeViewItem[] = [];
		const gitRepositories = await kubernetesTools.getGitRepositories();
		if (gitRepositories) {
			for (const gitRepository of gitRepositories.items) {
				treeItems.push(new GitRepositoryTreeViewItem(gitRepository));
			}
		}
		const helmRepositories = await kubernetesTools.getHelmRepositories();
		if (helmRepositories) {
			for (const helmRepository of helmRepositories.items) {
				treeItems.push(new HelmRepositoryTreeViewItem(helmRepository));
			}
		}
		const buckets = await kubernetesTools.getBuckets();
		if (buckets) {
			for (const bucket of buckets.items) {
				treeItems.push(new BucketTreeViewItem(bucket));
			}
		}
    return treeItems;
  }
}

class GitRepositoryTreeViewItem extends TreeViewItem {
	constructor(gitRepository: GitRepositoryItem) {
		super({
			label: `Git: ${gitRepository.metadata.name}`,
		});

		const mdHover = new MarkdownString();
		mdHover.appendCodeblock(JSON.stringify(gitRepository, null, '  '), 'json');
		this.tooltip = mdHover;

		this.contextValue = TreeViewItemContext.GitRepository;
	}
}

class HelmRepositoryTreeViewItem extends TreeViewItem {
	constructor(helmRepository: HelmRepositoryItem) {
		super({
			label: `Helm Repository: ${helmRepository.metadata.name}`,
		});

		const mdHover = new MarkdownString();
		mdHover.appendCodeblock(JSON.stringify(helmRepository, null, '  '), 'json');
		this.tooltip = mdHover;

		this.contextValue = TreeViewItemContext.HelmRepository;
	}
}

class BucketTreeViewItem extends TreeViewItem {
	constructor(bucket: BucketItem) {
		super({
			label: `Bucket: ${bucket.metadata.name}`,
		});

		const mdHover = new MarkdownString();
		mdHover.appendCodeblock(JSON.stringify(bucket, null, '  '), 'json');
		this.tooltip = mdHover;

		this.contextValue = TreeViewItemContext.Bucket;
	}
}
