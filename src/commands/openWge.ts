import { CanaryNode } from 'ui/treeviews/nodes/workload/canaryNode';
import { env, Uri } from 'vscode';

export function openWgeCanary(node: CanaryNode) {
	const name = node.resource.metadata?.name;
	const url = `https://mccp.howard.moomboo.space/canary_details/details?clusterName=vcluster-howard-moomboo-stage%2Fhoward-moomboo-staging&name=${name}&namespace=default`;

	env.openExternal(Uri.parse(url));
}

