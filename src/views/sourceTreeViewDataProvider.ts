import { ExtensionContext, ExtensionMode} from 'vscode';
import { FileTypes } from '../fileTypes';
import { EditorCommands } from '../commands';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { Bucket } from '../kubernetes/bucket';
import { GitRepository } from '../kubernetes/gitRepository';
import { HelmRepository } from '../kubernetes/helmRepository';
import { ResourceTypes } from '../kubernetes/kubernetesTypes';
import { TreeViewDataProvider } from './treeViewDataProvider';
import { TreeViewItemContext } from './treeViewItemContext';
import { TreeViewItemLabels } from './treeViewItemLabels';
import { SourceTreeViewItem } from './sourceNode';
import { shortenRevision } from '../utils/stringUtils';


/**
 * Defines Sources data provider for loading Git/Helm repositories
 * and Buckets in GitOps Sources tree view.
 */
export class SourceTreeViewDataProvider extends TreeViewDataProvider {
	constructor(private extensionContext: ExtensionContext) {
		super();
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
export class GitRepositoryTreeViewItem extends SourceTreeViewItem {
	/**
	 * All of the kubernetes resource fetched data.
	 */
	resource: GitRepository;

	constructor(gitRepository: GitRepository) {
		super({
			label: `${TreeViewItemLabels.GitRepository}: ${gitRepository.metadata?.name}`,
			description: shortenRevision(gitRepository.status.artifact?.revision),
		});

		this.resource = gitRepository;

		// set context type value for git repository commands
		this.contextValue = TreeViewItemContext.GitRepository;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(gitRepository);

		// set resource Uri to open git repository config document in editor
		this.resourceUri = kubernetesTools.getResourceUri(
			gitRepository.metadata?.namespace,
			`${ResourceTypes.GitRepository}/${gitRepository.metadata?.name}`,
			FileTypes.Yaml);

		// set open resource in editor command
		this.command = {
			command: EditorCommands.OpenResource,
			arguments: [this.resourceUri],
			title: 'View Resource',
		};
	}
}

/**
 *  Defines HelmRepository tree view item for display in GitOps Sources tree view.
 */
export class HelmRepositoryTreeViewItem extends SourceTreeViewItem {
	/**
	 * All of the kubernetes resource fetched data.
	 */
	resource: HelmRepository;

	constructor(helmRepository: HelmRepository) {
		super({
			label: `${TreeViewItemLabels.HelmRepositry}: ${helmRepository.metadata?.name}`,
			description: shortenRevision(helmRepository.status.artifact?.revision),
		});

		this.resource = helmRepository;

		// set context type value for helm repository commands
		this.contextValue = TreeViewItemContext.HelmRepository;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(helmRepository);

		// set resource Uri to open helm repository config document in editor
		this.resourceUri = kubernetesTools.getResourceUri(
			helmRepository.metadata?.namespace,
			`${ResourceTypes.HelmRepository}/${helmRepository.metadata?.name}`,
			FileTypes.Yaml);

		// set open resource in editor command
		this.command = {
			command: EditorCommands.OpenResource,
			arguments: [this.resourceUri],
			title: 'View Resource',
		};
	}
}

/**
 *  Defines Bucket tree view item for display in GitOps Sources tree view.
 */
export class BucketTreeViewItem extends SourceTreeViewItem {
	/**
	 * All of the kubernetes resource fetched data.
	 */
	resource: Bucket;

	constructor(bucket: Bucket) {
		super({
			label: `${TreeViewItemLabels.Bucket}: ${bucket.metadata?.name}`,
			description: shortenRevision(bucket.status.artifact?.revision),
		});

		this.resource = bucket;

		// set context type value for bucket commands
		this.contextValue = TreeViewItemContext.Bucket;

		// show markdown tooltip
		this.tooltip = this.getMarkdown(bucket);

		// set resource Uri to open bucket config document in editor
		this.resourceUri = kubernetesTools.getResourceUri(
			bucket.metadata?.namespace,
			`${ResourceTypes.Bucket}/${bucket.metadata?.name}`,
			FileTypes.Yaml);

		// set open resource in editor command
		this.command = {
			command: EditorCommands.OpenResource,
			arguments: [this.resourceUri],
			title: 'View Resource',
		};
	}
}
