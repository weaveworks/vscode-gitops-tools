import { ContextTypes, setVSCodeContext } from '../../vscodeContext';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { statusBar } from '../../statusBar';
import { BucketNode } from '../nodes/bucketNode';
import { GitRepositoryNode } from '../nodes/gitRepositoryNode';
import { OCIRepositoryNode } from '../nodes/ociRepositoryNode';
import { HelmRepositoryNode } from '../nodes/helmRepositoryNode';
import { SourceNode } from '../nodes/sourceNode';
import { DataProvider } from './dataProvider';
import { sortByMetadataName } from '../../kubernetes/kubernetesUtils';

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

		setVSCodeContext(ContextTypes.LoadingSources, true);

		// Fetch all sources asynchronously and at once
		const [gitRepositories, ociRepositories, helmRepositories, buckets] = await Promise.all([
			kubernetesTools.getGitRepositories(),
			kubernetesTools.getOciRepositories(),
			kubernetesTools.getHelmRepositories(),
			kubernetesTools.getBuckets(),
		]);

		// add git repositories to the tree
		if (gitRepositories) {
			for (const gitRepository of sortByMetadataName(gitRepositories.items)) {
				treeItems.push(new GitRepositoryNode(gitRepository));
			}
		}

		// add oci repositories to the tree
		if (ociRepositories) {
			for (const ociRepository of sortByMetadataName(ociRepositories.items)) {
				treeItems.push(new OCIRepositoryNode(ociRepository));
			}
		}

		// add helm repositores to the tree
		if (helmRepositories) {
			for (const helmRepository of sortByMetadataName(helmRepositories.items)) {
				treeItems.push(new HelmRepositoryNode(helmRepository));
			}
		}

		// add buckets to the tree
		if (buckets) {
			for (const bucket of sortByMetadataName(buckets.items)) {
				treeItems.push(new BucketNode(bucket));
			}
		}

		setVSCodeContext(ContextTypes.LoadingSources, false);
		setVSCodeContext(ContextTypes.NoSources, treeItems.length === 0);
		statusBar.stopLoadingTree();

		return treeItems;
	}
}
