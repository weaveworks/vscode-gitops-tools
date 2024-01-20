import { window } from 'vscode';
import { telemetry } from 'extension';
import { k8sListNamespaces } from 'k8s/list';
import { Namespace } from 'types/kubernetes/kubernetesTypes';
import { TelemetryError } from 'types/telemetryEventNames';
import { parseJsonItems } from 'utils/jsonUtils';
import { invokeKubectlCommand } from './kubernetesToolsKubectl';

/**
 * Get namespaces from current context.
 */
let nsCache: Namespace[] = [];
export async function getNamespaces(): Promise<Namespace[]> {
	const k8sns = await k8sListNamespaces();
	if (k8sns !== undefined) {
		nsCache = k8sns;
		return k8sns;
	}

	const shellResult = await invokeKubectlCommand('get ns -o json');

	if (shellResult?.code !== 0) {
		telemetry.sendError(TelemetryError.FAILED_TO_GET_NAMESPACES);
		window.showErrorMessage(`Failed to get namespaces ${shellResult?.stderr}`);
		return [];
	}

	nsCache = parseJsonItems(shellResult.stdout);
	return nsCache;
}

export function getCachedNamespaces(): Namespace[] {
	return nsCache;
}

export async function getNamespace(name: string): Promise<Namespace | undefined> {
	const cachedNs = getCachedNamespaces().find(ns => ns.metadata.name === name);
	if (cachedNs) {
		return cachedNs;
	}

	const namespaces = await getNamespaces();
	return namespaces.find(ns => ns.metadata.name === name);
}
