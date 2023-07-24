import { window } from 'vscode';

import { AzureClusterProvider, azureTools } from 'cli/azure/azureTools';
import { fluxTools } from 'cli/flux/fluxTools';
import { telemetry } from 'extension';
import { failed } from 'types/errorable';
import { FluxSource } from 'types/fluxCliTypes';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { TelemetryEvent } from 'types/telemetryEventNames';
import { BucketNode } from 'ui/treeviews/nodes/source/bucketNode';
import { GitRepositoryNode } from 'ui/treeviews/nodes/source/gitRepositoryNode';
import { HelmRepositoryNode } from 'ui/treeviews/nodes/source/helmRepositoryNode';
import { OCIRepositoryNode } from 'ui/treeviews/nodes/source/ociRepositoryNode';
import { getCurrentClusterInfo, refreshSourcesTreeView, refreshWorkloadsTreeView } from 'ui/treeviews/treeViews';
import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';

/**
 * Delete a source
 *
 * @param sourceNode Sources tree view node
 */
export async function deleteSource(sourceNode: GitRepositoryNode | OCIRepositoryNode | HelmRepositoryNode | BucketNode) {

	const sourceName = sourceNode.resource.metadata?.name || '';
	const sourceNamespace = sourceNode.resource.metadata?.namespace || '';
	const confirmButton = 'Delete';

	const sourceType: FluxSource | 'unknown' = sourceNode.resource.kind === Kind.GitRepository ? 'source git' :
		sourceNode.resource.kind === Kind.HelmRepository ? 'source helm' :
			sourceNode.resource.kind === Kind.OCIRepository ? 'source oci' :
				sourceNode.resource.kind === Kind.Bucket ? 'source bucket' : 'unknown';

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

	telemetry.send(TelemetryEvent.DeleteSource, {
		kind: sourceNode.resource.kind,
	});

	const currentClusterInfo = await getCurrentClusterInfo();
	const contextName = kubeConfig.getCurrentContext();
	if (failed(currentClusterInfo)) {
		return;
	}

	if (currentClusterInfo.result.isAzure) {
		await azureTools.deleteSource(sourceName, contextName, currentClusterInfo.result.clusterProvider as AzureClusterProvider);
		refreshWorkloadsTreeView();
	} else {
		await fluxTools.delete(sourceType, sourceName, sourceNamespace);
	}

	refreshSourcesTreeView();
}
