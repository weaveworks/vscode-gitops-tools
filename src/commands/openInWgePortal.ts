import { currentContextData } from 'data/contextData';
import { ToolkitNode } from 'ui/treeviews/nodes/toolkitNode';
import { env, Uri } from 'vscode';

export function openInWgePortal(node: ToolkitNode) {
	const name = node.resource.metadata?.name;
	const namespace = node.resource.metadata?.namespace || 'default';

	const portalHost = currentContextData().wgePortalHost;
	const clusterName =  currentContextData().contextName;
	if (!portalHost) {
		return;
	}

	const url = `https://${portalHost}/canary_details/details?clusterName=${clusterName}&name=${name}&namespace=${namespace}`;
	// const url = `https://${portalHost}/canary_details/details?clusterName=vcluster-howard-moomboo-stage%2Fhoward-moomboo-staging&name=${name}&namespace=${namespace}`;

	env.openExternal(Uri.parse(url));
}

