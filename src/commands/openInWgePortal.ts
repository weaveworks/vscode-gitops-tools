import { currentContextData } from 'data/contextData';
import { ToolkitNode } from 'ui/treeviews/nodes/toolkitNode';
import { CanaryNode } from 'ui/treeviews/nodes/wge/canaryNode';
import { GitOpsTemplateNode } from 'ui/treeviews/nodes/wge/gitOpsTemplateNode';
import { PipelineNode } from 'ui/treeviews/nodes/wge/pipelineNode';
import { env, Uri } from 'vscode';

export function openInWgePortal(node: ToolkitNode | GitOpsTemplateNode) {
	const name = node.resource.metadata?.name;
	const namespace = node.resource.metadata?.namespace || 'default';

	const portalHost = currentContextData().wgePortalHost;
	const clusterName =  currentContextData().contextName;
	if (!portalHost) {
		return;
	}

	let query = '';

	switch(node.constructor) {
		case GitOpsTemplateNode:
			// no narrowing type switch in typescript
			if(node instanceof GitOpsTemplateNode && node.templateType === 'cluster') {
				query = `templates/create?name=${name}&namespace=${namespace}`;
			}
			break;
		case PipelineNode:
			query = `pipelines/details/status?kind=Pipeline&name=${name}&namespace=${namespace}`;
			break;
		case CanaryNode:
			query = `canary_details/details?clusterName=${clusterName}&name=${name}&namespace=${namespace}`;
			break;

	}

	const url = `https://${portalHost}/${query}`;
	// const url = `https://${portalHost}/canary_details/details?clusterName=vcluster-howard-moomboo-stage%2Fhoward-moomboo-staging&name=${name}&namespace=${namespace}`;

	env.openExternal(Uri.parse(url));
}

