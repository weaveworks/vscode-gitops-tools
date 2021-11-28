import { V1ObjectMeta } from '@kubernetes/client-node';
import { commands, Uri, window } from 'vscode';
import { allKinds, ResourceKind } from '../kuberesources';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { ClusterDeploymentNode } from '../views/nodes/clusterDeploymentNode';

interface ResourceNode {
	readonly nodeType: 'resource';
	readonly name?: string;
	readonly namespace?: string;
	readonly kindName: string;
	readonly metadata: V1ObjectMeta;
	readonly kind: ResourceKind;
	uri(outputFormat: string): Uri;
}

/**
 * Show logs in the editor webview (running Kubernetes extension command)
 */
export async function showLogs(deploymentNode: ClusterDeploymentNode): Promise<void> {

	const pods = await kubernetesTools.getPodsOfADeployment(deploymentNode.resource.metadata.name, deploymentNode.resource.metadata.namespace);
	const pod = pods?.items[0];

	if (!pod) {
		window.showErrorMessage(`No pods were found from ${deploymentNode.resource.metadata.name} deployment.`);
		return;
	}

	const podResourceNode: ResourceNode = {
		nodeType: 'resource',
		name: pod.metadata.name,
		namespace: pod.metadata.namespace,
		metadata: pod.metadata,
		kindName: `pod/${pod.metadata.name}`,
		kind: allKinds.pod,
		uri(outputFormat: string) {
			return kubernetesTools.getResourceUri(this.namespace, this.kindName, outputFormat);
		},
	};

	commands.executeCommand('extension.vsKubernetesLogs', podResourceNode);
}
