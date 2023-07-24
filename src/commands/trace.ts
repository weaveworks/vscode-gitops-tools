import { window } from 'vscode';

import { fluxTools } from 'cli/flux/fluxTools';
import { telemetry } from 'extension';
import { AnyResourceNode } from 'ui/treeviews/nodes/anyResourceNode';
import { WorkloadNode } from 'ui/treeviews/nodes/workload/workloadNode';
import { getResource } from 'cli/kubernetes/kubectlGet';

/**
 * Run flux trace for the Workloads tree view node.
 */
export async function trace(node: AnyResourceNode | WorkloadNode) {
	const resourceName = node.resource?.metadata?.name || '';
	const resourceNamespace = node.resource?.metadata?.namespace || 'flux-system';
	const resourceKind = node.resource?.kind || '';
	let resourceApiVersion = node.resource?.apiVersion || '';

	if (!resourceName) {
		window.showErrorMessage('"name" is required to run `flux trace`.');
		telemetry.sendError('"name" is required to run `flux trace`.');
		return;
	}
	if (!resourceKind) {
		window.showErrorMessage('"kind" is required to run `flux trace`');
		telemetry.sendError('"kind" is required to run `flux trace`');
		return;
	}

	// flux tree fetched items don't have the "apiVersion" property
	if (!resourceApiVersion) {
		const resource = await getResource(resourceName, resourceNamespace, resourceKind);
		const apiVersion = resource?.apiVersion;
		if (!apiVersion && !apiVersion) {
			window.showErrorMessage('"apiVersion" is required to run `flux trace`');
			telemetry.sendError('"apiVersion" is required to run `flux trace`');
			return;
		}
		resourceApiVersion = apiVersion;
	}

	await fluxTools.trace(resourceName, resourceKind, resourceApiVersion, resourceNamespace);
}
