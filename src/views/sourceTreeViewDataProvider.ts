import {
	ExtensionContext,
	ExtensionMode,
	MarkdownString,
	TreeItemCollapsibleState
} from 'vscode';
import { Bucket } from '../kubernetes/bucket';
import { GitRepository } from '../kubernetes/gitRepository';
import { HelmRepository } from '../kubernetes/helmRepository';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { shortenRevision } from '../utils/stringUtils';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';
import { TreeViewItemContext } from './treeViewItemContext';
import { SourceTreeViewItem } from './sourceTreeViewItem';

let _extensionContext: ExtensionContext;

export class SourceTreeViewDataProvider extends TreeViewDataProvider {
	constructor(extensionContext: ExtensionContext) {
		super();
		_extensionContext = extensionContext;
	}

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

class GitRepositoryTreeViewItem extends SourceTreeViewItem {
	constructor(gitRepository: GitRepository) {
		super({
			label: `Git: ${gitRepository.metadata.name}`,
			description: shortenRevision(gitRepository.status.artifact?.revision),
		});
		this.contextValue = TreeViewItemContext.GitRepository;
		this.tooltip = this.getMarkdown(gitRepository); //, _extensionContext.extensionMode === ExtensionMode.Development);
	}

}

class HelmRepositoryTreeViewItem extends SourceTreeViewItem {
	constructor(helmRepository: HelmRepository) {
		super({
			label: `Helm Repository: ${helmRepository.metadata.name}`,
			description: shortenRevision(helmRepository.status.artifact?.revision),
		});
		this.contextValue = TreeViewItemContext.HelmRepository;
		this.tooltip = this.getMarkdown(helmRepository); //, _extensionContext.extensionMode === ExtensionMode.Development);
	}
}

class BucketTreeViewItem extends SourceTreeViewItem {
	constructor(bucket: Bucket) {
		super({
			label: `Bucket: ${bucket.metadata.name}`,
			description: shortenRevision(bucket.status.artifact?.revision),
		});
		this.contextValue = TreeViewItemContext.Bucket;
		this.tooltip = this.getMarkdown(bucket); //, _extensionContext.extensionMode === ExtensionMode.Development);
	}
}
