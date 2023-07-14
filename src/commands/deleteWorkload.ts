import { window } from 'vscode';

import { AzureClusterProvider, azureTools } from 'cli/azure/azureTools';
import { fluxTools } from 'cli/flux/fluxTools';
import { telemetry } from 'extension';
import { failed } from 'types/errorable';
import { FluxWorkload } from 'types/fluxCliTypes';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { TelemetryEvent } from 'types/telemetryEventNames';
import { HelmReleaseNode } from 'ui/treeviews/nodes/workload/helmReleaseNode';
import { KustomizationNode } from 'ui/treeviews/nodes/workload/kustomizationNode';
import { getCurrentClusterInfo, refreshWorkloadsTreeView } from 'ui/treeviews/treeViews';
import { kubeConfig } from 'cli/kubernetes/kubernetesConfig';


/**
 * Delete a workload
 *
 * @param workloadNode Workloads tree view node
 */
export async function deleteWorkload(workloadNode: KustomizationNode | HelmReleaseNode) {

	const workloadName = workloadNode.resource.metadata?.name || '';
	const workloadNamespace = workloadNode.resource.metadata?.namespace || '';
	const confirmButton = 'Delete';

	let workloadType: FluxWorkload;
	switch(workloadNode.resource.kind) {
		case Kind.Kustomization: {
			workloadType = 'kustomization';
			break;
		}

		case Kind.HelmRelease: {
			workloadType = 'helmrelease';
			break;
		}

		default: {
			return;
		}
	}

	const currentClusterInfo = await getCurrentClusterInfo();
	const contextName = kubeConfig.getCurrentContext();

	if (failed(currentClusterInfo) || !contextName) {
		return;
	}

	if (currentClusterInfo.result.isAzure && workloadType !== 'kustomization') {
		window.showWarningMessage('Delete HelmRelease not supported on Azure cluster.');
		return;
	}

	const pressedButton = await window.showWarningMessage(`Do you want to delete ${workloadNode.resource.kind} "${workloadName}"?`, {
		modal: true,
	}, confirmButton);
	if (!pressedButton) {
		return;
	}

	telemetry.send(TelemetryEvent.DeleteWorkload, {
		kind: workloadNode.resource.kind,
	});


	if (currentClusterInfo.result.isAzure && workloadType === 'kustomization') {
		const fluxConfigName = (workloadNode.resource.spec as any).sourceRef?.name;
		const azResourceName = azureTools.getAzName(fluxConfigName, workloadName);
		await azureTools.deleteKustomization(fluxConfigName, azResourceName, contextName, currentClusterInfo.result.clusterProvider as AzureClusterProvider);
	} else {
		await fluxTools.delete(workloadType, workloadName, workloadNamespace);
	}

	refreshWorkloadsTreeView();
}
