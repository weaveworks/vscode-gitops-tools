import { ConfigurationTarget, commands, window, workspace } from 'vscode';

import { getPodsOfADeployment } from 'cli/kubernetes/kubectlGet';
import { ResourceNode, podResourceKind } from 'types/showLogsTypes';
import { ClusterDeploymentNode } from 'ui/treeviews/nodes/cluster/clusterDeploymentNode';
import { getResourceUri } from 'utils/getResourceUri';

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

	const vscGitopsConfig = workspace.getConfiguration('gitops');
	if (vscGitopsConfig.get('ignoreConfigRecommendations')) {
		return;
	}

	const vscKubeConfig = workspace.getConfiguration('vscode-kubernetes.log-viewer');
	if (vscKubeConfig.get('autorun') && vscKubeConfig.get('follow')) {
		return;
	}

	window.showInformationMessage(
		'It\'s recommended to autorun and follow logs by default. Do you want to apply these settings?',
		'Apply Settings',
		'Never Show Again',
	).then(result => {
		if (!result) {
			return;
		}

		if (result === 'Never Show Again') {
			workspace.getConfiguration('gitops').update('ignoreConfigRecommendations', true, ConfigurationTarget.Global);
			return;
		}

		vscKubeConfig.update('autorun', true, ConfigurationTarget.Global);
		vscKubeConfig.update('follow', true, ConfigurationTarget.Global);
	});
}
