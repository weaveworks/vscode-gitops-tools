import { ExtensionContext, ExtensionMode } from 'vscode';
import { Bucket } from '../kubernetes/bucket';
import { GitRepository } from '../kubernetes/gitRepository';
import { HelmRepository } from '../kubernetes/helmRepository';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { shortenRevision } from '../utils/stringUtils';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';
import { generateSourceHover } from './treeViewItemHover';
import { TreeViewItemContext } from './views';

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

class GitRepositoryTreeViewItem extends TreeViewItem {
	constructor(gitRepository: GitRepository) {
		super({
			label: `Git: ${gitRepository.metadata.name}`,
			description: shortenRevision(gitRepository.status.artifact?.revision),
		});

		this.tooltip = generateSourceHover(gitRepository, _extensionContext.extensionMode === ExtensionMode.Development);

		this.contextValue = TreeViewItemContext.GitRepository;
	}
}

class HelmRepositoryTreeViewItem extends TreeViewItem {
	constructor(helmRepository: HelmRepository) {
		super({
			label: `Helm Repository: ${helmRepository.metadata.name}`,
			description: shortenRevision(helmRepository.status.artifact?.revision),
		});

		this.tooltip = generateSourceHover(helmRepository, _extensionContext.extensionMode === ExtensionMode.Development);

		this.contextValue = TreeViewItemContext.HelmRepository;
	}
}

class BucketTreeViewItem extends TreeViewItem {
	constructor(bucket: Bucket) {
		super({
			label: `Bucket: ${bucket.metadata.name}`,
			description: shortenRevision(bucket.status.artifact?.revision),
		});

		this.tooltip = generateSourceHover(bucket, _extensionContext.extensionMode === ExtensionMode.Development);

		this.contextValue = TreeViewItemContext.Bucket;
	}
}
