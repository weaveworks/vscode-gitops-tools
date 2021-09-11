import { ExtensionContext, ExtensionMode} from 'vscode';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { Bucket } from '../kubernetes/bucket';
import { GitRepository } from '../kubernetes/gitRepository';
import { HelmRepository } from '../kubernetes/helmRepository';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItem } from './treeViewItem';
import { TreeViewItemContext } from './treeViewItemContext';
import { SourceTreeViewItem } from './sourceTreeViewItem';
import { TreeViewItemLabels } from './treeViewItemLabels';
import { shortenRevision } from '../utils/stringUtils';

let _extensionContext: ExtensionContext;

/**
 * Defines Sources data provider for loading Git/Helm repositories
 * and Buckets in GitOps Sources tree view.
 */
export class SourceTreeViewDataProvider extends TreeViewDataProvider {
	constructor(extensionContext: ExtensionContext) {
		super();
		_extensionContext = extensionContext;
	}

	/**
   * Creates Source tree view items for the currently selected kubernetes cluster.
   * @returns Source tree view items to display.
   */
	 async buildTree(): Promise<SourceTreeViewItem[]> {
		const treeItems: SourceTreeViewItem[] = [];

		// load git repositories for the current cluster
		const gitRepositories = await kubernetesTools.getGitRepositories();
		if (gitRepositories) {
			for (const gitRepository of gitRepositories.items) {
				treeItems.push(new GitRepositoryTreeViewItem(gitRepository));
			}
		}

		// load helm repositores for the current cluster
		const helmRepositories = await kubernetesTools.getHelmRepositories();
		if (helmRepositories) {
			for (const helmRepository of helmRepositories.items) {
				treeItems.push(new HelmRepositoryTreeViewItem(helmRepository));
			}
		}

		// load buckets for the current cluster
		const buckets = await kubernetesTools.getBuckets();
		if (buckets) {
			for (const bucket of buckets.items) {
				treeItems.push(new BucketTreeViewItem(bucket));
			}
		}
    return treeItems;
  }
}

/**
 *  Defines GitRepository tree view item for display in GitOps Sources tree view.
 */
class GitRepositoryTreeViewItem extends SourceTreeViewItem {
	constructor(gitRepository: GitRepository) {
		super({
			label: `${TreeViewItemLabels.GitRepository}: ${gitRepository.metadata.name}`,
			description: shortenRevision(gitRepository.status.artifact?.revision),
		});
		this.contextValue = TreeViewItemContext.GitRepository;
		this.tooltip = this.getMarkdown(gitRepository); //, _extensionContext.extensionMode === ExtensionMode.Development);
	}

}

/**
 *  Defines HelmRepository tree view item for display in GitOps Sources tree view.
 */
class HelmRepositoryTreeViewItem extends SourceTreeViewItem {
	constructor(helmRepository: HelmRepository) {
		super({
			label: `${TreeViewItemLabels.HelmRepositry}: ${helmRepository.metadata.name}`,
			description: shortenRevision(helmRepository.status.artifact?.revision),
		});
		this.contextValue = TreeViewItemContext.HelmRepository;
		this.tooltip = this.getMarkdown(helmRepository); //, _extensionContext.extensionMode === ExtensionMode.Development);
	}
}

/**
 *  Defines Bucket tree view item for display in GitOps Sources tree view.
 */
class BucketTreeViewItem extends SourceTreeViewItem {
	constructor(bucket: Bucket) {
		super({
			label: `${TreeViewItemLabels.Bucket}: ${bucket.metadata.name}`,
			description: shortenRevision(bucket.status.artifact?.revision),
		});
		this.contextValue = TreeViewItemContext.Bucket;
		this.tooltip = this.getMarkdown(bucket); //, _extensionContext.extensionMode === ExtensionMode.Development);
	}
}
