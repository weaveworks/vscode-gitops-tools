import { window } from 'vscode';
import { AzureClusterProvider, azureTools, isAzureProvider } from '../azure/azureTools';
import { failed } from '../errorable';
import { telemetry } from '../extension';
import { fluxTools } from '../flux/fluxTools';
import { FluxWorkload } from '../flux/fluxTypes';
import { KubernetesObjectKinds } from '../kubernetes/kubernetesTypes';
import { TelemetryEventNames } from '../telemetry';
import { KustomizationNode } from '../views/nodes/kustomizationNode';
import { HelmReleaseNode } from '../views/nodes/helmReleaseNode';
import { getCurrentClusterInfo, refreshWorkloadsTreeView } from '../views/treeViews';


/**
 * Delete a workload
 *
 * @param workloadNode Workloads tree view node
 */
export async function deleteWorkload(workloadNode: KustomizationNode | HelmReleaseNode) {

	const workloadName = workloadNode.resource.metadata.name || '';
	const workloadNamespace = workloadNode.resource.metadata.namespace || '';
	const confirmButton = 'Delete';

	let workloadType: FluxWorkload;
	switch(workloadNode.resource.kind) {
		case KubernetesObjectKinds.Kustomization: {
			workloadType = 'kustomization';
			break;
		}

		case KubernetesObjectKinds.HelmRelease: {
			workloadType = 'helmrelease';
			break;
		}

		default: {
			return;
		}
	}

	const currentClusterInfo = await getCurrentClusterInfo();
	if (failed(currentClusterInfo)) {
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

	telemetry.send(TelemetryEventNames.DeleteWorkload, {
		kind: workloadNode.resource.kind,
	});


	if (currentClusterInfo.result.isAzure && workloadType === 'kustomization') {
		const fluxConfigName = (workloadNode.resource.spec as any).sourceRef?.name;
		const azResourceName = azureTools.getAzName(fluxConfigName, workloadName);
		await azureTools.deleteKustomization(fluxConfigName, azResourceName, currentClusterInfo.result.contextName, currentClusterInfo.result.clusterProvider as AzureClusterProvider);
	} else {
		await fluxTools.delete(workloadType, workloadName, workloadNamespace);
	}

	refreshWorkloadsTreeView();
}
