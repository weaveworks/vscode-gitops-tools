import { currentContextData } from 'data/contextData';
import { CanaryNode } from 'ui/treeviews/nodes/wge/canaryNode';
import { GitOpsSetNode } from 'ui/treeviews/nodes/wge/gitOpsSetNode';
import { GitOpsTemplateNode } from 'ui/treeviews/nodes/wge/gitOpsTemplateNode';
import { PipelineNode } from 'ui/treeviews/nodes/wge/pipelineNode';
import { WgeContainerNode } from 'ui/treeviews/nodes/wge/wgeContainerNodes';
import { env, Uri } from 'vscode';


type WgePortalNode = GitOpsTemplateNode | PipelineNode | CanaryNode | GitOpsSetNode | WgeContainerNode;

export function openInWgePortal(node: WgePortalNode) {
	const portalHost = currentContextData().wgePortalHost;
	if(!portalHost) {
		return;
	}

	const query = node.wgePortalQuery;
	const url = `https://${portalHost}/${query}`;

	// const url = `https://${portalHost}/canary_details/details?clusterName=vcluster-howard-moomboo-stage%2Fhoward-moomboo-staging&name=${name}&namespace=${namespace}`;
	env.openExternal(Uri.parse(url));
}

