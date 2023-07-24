import { commands, window } from 'vscode';

import { getPodsOfADeployment } from 'cli/kubernetes/kubectlGet';
import { ClusterDeploymentNode } from 'ui/treeviews/nodes/cluster/clusterDeploymentNode';
import { getResourceUri } from 'utils/getResourceUri';
import { ResourceNode, podResourceKind } from 'types/showLogsTypes';

/**
 * Show logs in the editor webview (running Kubernetes extension command)
 */
export async function showLogs(deploymentNode: ClusterDeploymentNode): Promise<void> {

	const pods = await getPodsOfADeployment(deploymentNode.resource.metadata?.name, deploymentNode.resource.metadata?.namespace);
	const pod = pods[0];

	if (!pod) {
		window.showErrorMessage(`No pods were found from ${deploymentNode.resource.metadata?.name} deployment.`);
		return;
	}

	const podResourceNode: ResourceNode = {
		nodeType: 'resource',
		name: pod.metadata.name,
		namespace: pod.metadata.namespace,
		metadata: pod.metadata,
		kindName: `pod/${pod.metadata.name}`,
		kind: podResourceKind,
		uri(outputFormat: string) {
			return getResourceUri(this.namespace, this.kindName, outputFormat);
		},
	};

	commands.executeCommand('extension.vsKubernetesLogs', podResourceNode);
}
