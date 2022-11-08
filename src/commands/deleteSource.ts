import { window } from 'vscode';
import { AzureClusterProvider, azureTools, isAzureProvider } from '../azure/azureTools';
import { failed } from '../errorable';
import { telemetry } from '../extension';
import { fluxTools } from '../flux/fluxTools';
import { FluxSource } from '../flux/fluxTypes';
import { checkIfOpenedFolderGitRepositorySourceExists } from '../git/checkIfOpenedFolderGitRepositorySourceExists';
import { KubernetesObjectKinds } from '../kubernetes/types/kubernetesTypes';
import { TelemetryEventNames } from '../telemetry';
import { BucketNode } from '../views/nodes/bucketNode';
import { GitRepositoryNode } from '../views/nodes/gitRepositoryNode';
import { OCIRepositoryNode } from '../views/nodes/ociRepositoryNode';
import { HelmRepositoryNode } from '../views/nodes/helmRepositoryNode';
import { getCurrentClusterInfo, refreshSourcesTreeView, refreshWorkloadsTreeView } from '../views/treeViews';

/**
 * Delete a source
 *
 * @param sourceNode Sources tree view node
 */
export async function deleteSource(sourceNode: GitRepositoryNode | OCIRepositoryNode | HelmRepositoryNode | BucketNode) {

	const sourceName = sourceNode.resource.metadata.name || '';
	const sourceNamespace = sourceNode.resource.metadata.namespace || '';
	const confirmButton = 'Delete';

	const sourceType: FluxSource | 'unknown' = sourceNode.resource.kind === KubernetesObjectKinds.GitRepository ? 'source git' :
		sourceNode.resource.kind === KubernetesObjectKinds.HelmRepository ? 'source helm' :
			sourceNode.resource.kind === KubernetesObjectKinds.OCIRepository ? 'source oci' :
				sourceNode.resource.kind === KubernetesObjectKinds.Bucket ? 'source bucket' : 'unknown';

	if (sourceType === 'unknown') {
		window.showErrorMessage(`Unknown Source resource kind ${sourceNode.resource.kind}`);
		return;
	}

	const pressedButton = await window.showWarningMessage(`Do you want to delete ${sourceNode.resource.kind} "${sourceName}"?`, {
		modal: true,
	}, confirmButton);
	if (!pressedButton) {
		return;
	}

	telemetry.send(TelemetryEventNames.DeleteSource, {
		kind: sourceNode.resource.kind,
	});

	const currentClusterInfo = await getCurrentClusterInfo();
	if (failed(currentClusterInfo)) {
		return;
	}

	if (currentClusterInfo.result.isAzure) {
		await azureTools.deleteSource(sourceName, currentClusterInfo.result.contextName, currentClusterInfo.result.clusterProvider as AzureClusterProvider);
		refreshWorkloadsTreeView();
	} else {
		await fluxTools.delete(sourceType, sourceName, sourceNamespace);
	}

	refreshSourcesTreeView();

	if (sourceType === 'source git') {
		checkIfOpenedFolderGitRepositorySourceExists();
	}
}
