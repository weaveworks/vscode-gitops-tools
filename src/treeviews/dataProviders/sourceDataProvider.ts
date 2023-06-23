import { setVSCodeContext } from '../../extension';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { sortByMetadataName } from '../../kubernetes/kubernetesUtils';
import { statusBar } from '../../statusBar';
import { ContextId } from '../../types/extensionIds';
import { BucketNode } from '../nodes/bucketNode';
import { GitRepositoryNode } from '../nodes/gitRepositoryNode';
import { HelmRepositoryNode } from '../nodes/helmRepositoryNode';
import { NamespaceNode } from '../nodes/namespaceNode';
import { OCIRepositoryNode } from '../nodes/ociRepositoryNode';
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
	async buildTree(): Promise<NamespaceNode[]> {
		statusBar.startLoadingTree();

		const treeItems: SourceNode[] = [];

		setVSCodeContext(ContextId.LoadingSources, true);

		// Fetch all sources asynchronously and at once
		const [gitRepositories, ociRepositories, helmRepositories, buckets, namespaces] = await Promise.all([
			kubernetesTools.getGitRepositories(),
			kubernetesTools.getOciRepositories(),
			kubernetesTools.getHelmRepositories(),
			kubernetesTools.getBuckets(),
			kubernetesTools.getNamespaces(),
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

		setVSCodeContext(ContextId.LoadingSources, false);
		setVSCodeContext(ContextId.NoSources, treeItems.length === 0);
		statusBar.stopLoadingTree();

		return this.groupByNamespace(namespaces?.items || [], treeItems);
	}
}
