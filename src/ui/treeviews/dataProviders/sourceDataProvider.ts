import { getBuckets, getGitRepositories, getHelmRepositories, getNamespaces, getOciRepositories } from 'cli/kubernetes/kubectlGet';
import { setVSCodeContext } from 'extension';
import { ContextId } from 'types/extensionIds';
import { statusBar } from 'ui/statusBar';
import { sortByMetadataName } from 'utils/sortByMetadataName';
import { BucketNode } from '../nodes/source/bucketNode';
import { GitRepositoryNode } from '../nodes/source/gitRepositoryNode';
import { HelmRepositoryNode } from '../nodes/source/helmRepositoryNode';
import { NamespaceNode } from '../nodes/namespaceNode';
import { OCIRepositoryNode } from '../nodes/source/ociRepositoryNode';
import { SourceNode } from '../nodes/source/sourceNode';
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
			getGitRepositories(),
			getOciRepositories(),
			getHelmRepositories(),
			getBuckets(),
			getNamespaces(),
		]);

		// add git repositories to the tree
		for (const gitRepository of sortByMetadataName(gitRepositories)) {
			treeItems.push(new GitRepositoryNode(gitRepository));
		}


		// add oci repositories to the tree
		for (const ociRepository of sortByMetadataName(ociRepositories)) {
			treeItems.push(new OCIRepositoryNode(ociRepository));
		}

		for (const helmRepository of sortByMetadataName(helmRepositories)) {
			treeItems.push(new HelmRepositoryNode(helmRepository));
		}

		// add buckets to the tree
		for (const bucket of sortByMetadataName(buckets)) {
			treeItems.push(new BucketNode(bucket));
		}

		setVSCodeContext(ContextId.LoadingSources, false);
		setVSCodeContext(ContextId.NoSources, treeItems.length === 0);
		statusBar.stopLoadingTree();

		return this.groupByNamespace(namespaces, treeItems);
	}
}
