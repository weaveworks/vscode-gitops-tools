import { ContextTypes, setContext } from '../../context';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { statusBar } from '../../statusBar';
import { BucketNode } from '../nodes/bucketNode';
import { GitRepositoryNode } from '../nodes/gitRepositoryNode';
import { HelmRepositoryNode } from '../nodes/helmRepositoryNode';
import { SourceNode } from '../nodes/sourceNode';
import { DataProvider } from './dataProvider';

/**
 * Defines Sources data provider for loading Git/Helm repositories
 * and Buckets in GitOps Sources tree view.
 */
export class SourceDataProvider extends DataProvider {

	/**
   * Creates Source tree view items for the currently selected kubernetes cluster.
   * @returns Source tree view items to display.
   */
	async buildTree(): Promise<SourceNode[]> {
		statusBar.startLoadingTree();

		const treeItems: SourceNode[] = [];

		setContext(ContextTypes.LoadingSources, true);

		// load git repositories for the current cluster
		const gitRepositories = await kubernetesTools.getGitRepositories();
		if (gitRepositories) {
			for (const gitRepository of gitRepositories.items) {
				treeItems.push(new GitRepositoryNode(gitRepository));
			}
		}

		// load helm repositores for the current cluster
		const helmRepositories = await kubernetesTools.getHelmRepositories();
		if (helmRepositories) {
			for (const helmRepository of helmRepositories.items) {
				treeItems.push(new HelmRepositoryNode(helmRepository));
			}
		}

		// load buckets for the current cluster
		const buckets = await kubernetesTools.getBuckets();
		if (buckets) {
			for (const bucket of buckets.items) {
				treeItems.push(new BucketNode(bucket));
			}
		}

		setContext(ContextTypes.LoadingSources, false);
		setContext(ContextTypes.NoSources, treeItems.length === 0);
		statusBar.stopLoadingTree();

		return treeItems;
	}
}
