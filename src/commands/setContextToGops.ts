import { Context } from '@kubernetes/client-node';
import { kubeConfig, setCurrentContext, syncKubeConfig } from 'cli/kubernetes/kubernetesConfig';
import { GitOpsCluster } from 'types/flux/gitOpsCluster';
import { AnyResourceNode } from 'ui/treeviews/nodes/anyResourceNode';
import { window } from 'vscode';

export async function setContextToGitopsCluster(gopsNode: AnyResourceNode) {
	const resource = gopsNode.resource as GitOpsCluster;
	const clusterName = resource.metadata.name;

	let matchingContext: Context | undefined;
	kubeConfig.getContexts().forEach(context => {
		if (context.cluster === clusterName) {
			matchingContext = context;
			window.showInformationMessage(`Found cluster name matching '${clusterName}'`);

		}
	});

	if(!matchingContext) {
		kubeConfig.getContexts().forEach(context => {
			if (context.name === clusterName) {
				matchingContext = context;
				window.showInformationMessage(`Found context name matching '${clusterName}'`);

			}
		});
	}

	if(!matchingContext) {
		window.showWarningMessage(`Could not find context name or cluster name matching '${clusterName}'`);
		return;
	}

	const setContextResult = await setCurrentContext(matchingContext.name);
	if (setContextResult?.isChanged) {
		await syncKubeConfig();
	}
}

