import { ContextTypes, setVSCodeContext } from '../../vscodeContext';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { statusBar } from '../../statusBar';
import { BucketNode } from '../nodes/bucketNode';
import { GitRepositoryNode } from '../nodes/gitRepositoryNode';
import { HelmRepositoryNode } from '../nodes/helmRepositoryNode';
import { SourceNode } from '../nodes/sourceNode';
import { DataProvider } from './dataProvider';
import { GitRepositoryResult } from '../../kubernetes/gitRepository';
import { HelmRepositoryResult } from '../../kubernetes/helmRepository';
import { BucketResult } from '../../kubernetes/bucket';

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
		const [gitRepositories, helmRepositories, buckets] = await Promise.all([
			kubernetesTools.getGitRepositories(),
			kubernetesTools.getHelmRepositories(),
			kubernetesTools.getBuckets(),
		]);

		// add git repositories to the tree
		if (gitRepositories) {
			for (const gitRepository of this.sortGitsByMetadataName(gitRepositories)) {
				treeItems.push(new GitRepositoryNode(gitRepository));
			}
		}

		// add helm repositores to the tree
		if (helmRepositories) {
			for (const helmRepository of this.sortHelmsByMetadataName(helmRepositories)) {
				treeItems.push(new HelmRepositoryNode(helmRepository));
			}
		}

		// add buckets to the tree
		if (buckets) {
			for (const bucket of this.sortBucketsByMetadataName(buckets)) {
				treeItems.push(new BucketNode(bucket));
			}
		}

		setVSCodeContext(ContextTypes.LoadingSources, false);
		setVSCodeContext(ContextTypes.NoSources, treeItems.length === 0);
		statusBar.stopLoadingTree();

		return treeItems;
	}

	sortGitsByMetadataName(gits: GitRepositoryResult): GitRepositoryResult['items'] {
		return gits.items.sort((g1, g2) => {
			if (g1.metadata.name && g2.metadata.name) {
				if (g1.metadata.name > g2.metadata.name) {
					return 1;
				}
				if (g1.metadata.name < g2.metadata.name) {
					return -1;
				}
			}
			return 0;
		});
	}

	sortHelmsByMetadataName(helms: HelmRepositoryResult): HelmRepositoryResult['items'] {
		return helms.items.sort((h1, h2) => {
			if (h1.metadata.name && h2.metadata.name) {
				if (h1.metadata.name > h2.metadata.name) {
					return 1;
				}
				if (h1.metadata.name < h2.metadata.name) {
					return -1;
				}
			}
			return 0;
		});
	}

	sortBucketsByMetadataName(buckets: BucketResult): BucketResult['items'] {
		return buckets.items.sort((b1, b2) => {
			if (b1.metadata.name && b2.metadata.name) {
				if (b1.metadata.name > b2.metadata.name) {
					return 1;
				}
				if (b1.metadata.name < b2.metadata.name) {
					return -1;
				}
			}
			return 0;
		});
	}
}
