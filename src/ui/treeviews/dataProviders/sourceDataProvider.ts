import { getBuckets, getGitRepositories, getHelmRepositories, getOciRepositories } from 'cli/kubernetes/kubectlGet';
import { getNamespaces } from 'cli/kubernetes/kubectlGetNamespace';
import { ContextData } from 'data/contextData';
import { statusBar } from 'ui/statusBar';
import { sortByMetadataName } from 'utils/sortByMetadataName';
import { groupNodesByNamespace } from 'utils/treeNodeUtils';
import { BucketNode } from '../nodes/source/bucketNode';
import { GitRepositoryNode } from '../nodes/source/gitRepositoryNode';
import { HelmRepositoryNode } from '../nodes/source/helmRepositoryNode';
import { OCIRepositoryNode } from '../nodes/source/ociRepositoryNode';
import { SourceNode } from '../nodes/source/sourceNode';
import { KubernetesObjectDataProvider } from './kubernetesObjectDataProvider';

/**
 * Defines Sources data provider for loading Git/Helm repositories
 * and Buckets in GitOps Sources tree view.
 */
export class SourceDataProvider extends KubernetesObjectDataProvider {

	protected viewData(contextData: ContextData) {
		return contextData.viewData.source;
	}

	/**
   * Creates Source tree view items for the currently selected kubernetes cluster.
   */
	async loadRootNodes() {
		statusBar.startLoadingTree();

		const sourceNodes: SourceNode[] = [];

		// Fetch all sources asynchronously and at once
		const [gitRepositories, ociRepositories, helmRepositories, buckets, _] = await Promise.all([
			getGitRepositories(),
			getOciRepositories(),
			getHelmRepositories(),
			getBuckets(),
			getNamespaces(), // cache namespaces
		]);

		// add git repositories to the tree
		for (const gitRepository of sortByMetadataName(gitRepositories)) {
			sourceNodes.push(new GitRepositoryNode(gitRepository));
		}

		// add oci repositories to the tree
		for (const ociRepository of sortByMetadataName(ociRepositories)) {
			sourceNodes.push(new OCIRepositoryNode(ociRepository));
		}

		for (const helmRepository of sortByMetadataName(helmRepositories)) {
			sourceNodes.push(new HelmRepositoryNode(helmRepository));
		}

		// add buckets to the tree
		for (const bucket of sortByMetadataName(buckets)) {
			sourceNodes.push(new BucketNode(bucket));
		}

		statusBar.stopLoadingTree();

		const [groupedNodes] = await groupNodesByNamespace(sourceNodes, false, true);
		return groupedNodes;
	}
}
