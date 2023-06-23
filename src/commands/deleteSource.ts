import { window } from 'vscode';
import { AzureClusterProvider, azureTools, isAzureProvider } from '../cli/azure/azureTools';
import { failed } from '../types/errorable';
import { telemetry } from '../extension';
import { fluxTools } from '../cli/flux/fluxTools';
import { FluxSource } from '../types/fluxCliTypes';
import { KubernetesObjectKinds } from '../types/kubernetes/kubernetesTypes';
import { TelemetryEventNames } from '../types/telemetryEventNames';
import { BucketNode } from '../treeviews/nodes/bucketNode';
import { GitRepositoryNode } from '../treeviews/nodes/gitRepositoryNode';
import { OCIRepositoryNode } from '../treeviews/nodes/ociRepositoryNode';
import { HelmRepositoryNode } from '../treeviews/nodes/helmRepositoryNode';
import { getCurrentClusterInfo, refreshSourcesTreeView, refreshWorkloadsTreeView } from '../treeviews/treeViews';

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
}
