import { kubectlPatchNamespacedResource } from 'cli/kubernetes/kubernetesToolsKubectl';
import { PipelineNode } from 'ui/treeviews/nodes/wge/pipelineNode';

export async function setPipelineAutoPromotion(node: PipelineNode) {
	await kubectlPatchNamespacedResource(node.resource, '{"spec": {"promotion": {"manual": false}}}');

	node.dataProvider.reload();
}

export async function setPipelineManualPromotion(node: PipelineNode) {
	await kubectlPatchNamespacedResource(node.resource, '{"spec": {"promotion": {"manual": true}}}');

	node.dataProvider.reload();
}
