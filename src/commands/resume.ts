
import { kubectlPatchNamespacedResource } from 'cli/kubernetes/kubernetesToolsKubectl';
import { GitRepositoryNode } from 'ui/treeviews/nodes/source/gitRepositoryNode';
import { HelmRepositoryNode } from 'ui/treeviews/nodes/source/helmRepositoryNode';
import { GitOpsSetNode } from 'ui/treeviews/nodes/wge/gitOpsSetNode';
import { HelmReleaseNode } from 'ui/treeviews/nodes/workload/helmReleaseNode';
import { KustomizationNode } from 'ui/treeviews/nodes/workload/kustomizationNode';

export async function resume(node: GitRepositoryNode | HelmReleaseNode | KustomizationNode | HelmRepositoryNode | GitOpsSetNode) {
	await kubectlPatchNamespacedResource(node.resource, '{"spec": {"suspend": false}}');

	node.dataProvider.reload();
}

