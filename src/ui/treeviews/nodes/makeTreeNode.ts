import { KubernetesObject } from '@kubernetes/client-node';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { AnyResourceNode } from './anyResourceNode';
import { NamespaceNode } from './namespaceNode';
import { BucketNode } from './source/bucketNode';
import { GitRepositoryNode } from './source/gitRepositoryNode';
import { HelmRepositoryNode } from './source/helmRepositoryNode';
import { OCIRepositoryNode } from './source/ociRepositoryNode';
import { TreeNode } from './treeNode';
import { CanaryNode } from './wge/canaryNode';
import { GitOpsSetNode } from './wge/gitOpsSetNode';
import { GitOpsTemplateNode } from './wge/gitOpsTemplateNode';
import { HelmReleaseNode } from './workload/helmReleaseNode';
import { KustomizationNode } from './workload/kustomizationNode';

// eslint-disable-next-line @typescript-eslint/ban-types
const nodeConstructors  = {
	'Bucket': BucketNode,
	'GitRepository': GitRepositoryNode,
	'OCIRepository': OCIRepositoryNode,
	'HelmRepository': HelmRepositoryNode,
	'HelmRelease': HelmReleaseNode,
	'Kustomization': KustomizationNode,
	'Canary': CanaryNode,
	'GitOpsTemplate': GitOpsTemplateNode,
	'GitOpsSet': GitOpsSetNode,
	'Pipeline': GitOpsSetNode,

	'Namespace': NamespaceNode,

	'Deployment': AnyResourceNode,
	'Node': AnyResourceNode,
	'Pod': AnyResourceNode,
	'ConfigMap': AnyResourceNode,
};

export function makeTreeNode(object: KubernetesObject): TreeNode | undefined {
	if(!object.kind) {
		return;
	}

	const constructor = nodeConstructors[object.kind as Kind];
	if(constructor) {
		return new constructor(object as any);
	}
}
