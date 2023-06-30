import safesh from 'shell-escape-tag';
import { window } from 'vscode';

import { telemetry } from 'extension';
import { Bucket } from 'types/flux/bucket';
import { GitOpsTemplate } from 'types/flux/gitOpsTemplate';
import { GitRepository } from 'types/flux/gitRepository';
import { HelmRelease } from 'types/flux/helmRelease';
import { HelmRepository } from 'types/flux/helmRepository';
import { Kustomization } from 'types/flux/kustomization';
import { OCIRepository } from 'types/flux/ociRepository';
import { Deployment, KubernetesObject, Namespace, Pod } from 'types/kubernetes/kubernetesTypes';
import { TelemetryError } from 'types/telemetryEventNames';
import { parseJson, parseJsonItems } from 'utils/jsonUtils';
import { invokeKubectlCommand } from './kubernetesToolsKubectl';

/*
	* Current cluster supported kubernetes resource kinds.
	*/
export let clusterSupportedResourceKinds: string[] | undefined;
export function clearSupportedResourceKinds(): void {
	clusterSupportedResourceKinds = undefined;
}
/**
 * RegExp for the Error that should not be sent in telemetry.
 * Server doesn't have a resource type = when GitOps not enabled
 * No connection could be made... = when cluster not running
 */
export const notAnErrorServerDoesntHaveResourceTypeRegExp = /the server doesn't have a resource type/i;
export const notAnErrorServerNotRunning = /no connection could be made because the target machine actively refused it/i;

/**
 * Get namespaces from current context.
 */
export async function getNamespaces(): Promise<Namespace[]> {
	const shellResult = await invokeKubectlCommand('get ns -o json');

	if (shellResult?.code !== 0) {
		telemetry.sendError(TelemetryError.FAILED_TO_GET_NAMESPACES);
		window.showErrorMessage(`Failed to get namespaces ${shellResult?.stderr}`);
		return [];
	}

	return parseJsonItems(shellResult.stdout);
}

/**
 * Get one resource object by kind/name and namespace
 * @param name name of the target resource
 * @param namespace namespace of the target resource
 * @param kind kind of the target resource
 */
export async function getResource(name: string, namespace: string, kind: string): Promise<undefined | KubernetesObject> {
	const shellResult = await invokeKubectlCommand(`get ${kind}/${name} --namespace=${namespace} -o json`);
	if (shellResult?.code !== 0) {
		telemetry.sendError(TelemetryError.FAILED_TO_GET_RESOURCE);
		return;
	}

	return parseJson(shellResult.stdout);
}

export async function getResourcesAllNamespaces<T extends KubernetesObject>(kind: string, telemetryError: TelemetryError): Promise<T[]> {
	const shellResult = await invokeKubectlCommand(`get ${kind} -A -o json`);

	if (shellResult?.code !== 0) {
		console.warn(`Failed to \`kubectl get ${kind} -A\`: ${shellResult?.stderr}`);
		if (shellResult?.stderr && !notAnErrorServerDoesntHaveResourceTypeRegExp.test(shellResult.stderr)) {
			telemetry.sendError(telemetryError);
		}
		return [];
	}

	return parseJsonItems(shellResult.stdout);
}


export async function getBuckets(): Promise<Bucket[]> {
	return getResourcesAllNamespaces('Buckets', TelemetryError.FAILED_TO_GET_BUCKETS);
}

export async function getGitRepositories(): Promise<GitRepository[]> {
	return getResourcesAllNamespaces('GitRepository', TelemetryError.FAILED_TO_GET_GIT_REPOSITORIES);
}

export async function getHelmRepositories(): Promise<HelmRepository[]> {
	return getResourcesAllNamespaces('HelmRepository', TelemetryError.FAILED_TO_GET_HELM_REPOSITORIES);
}

export async function getOciRepositories(): Promise<OCIRepository[]> {
	return getResourcesAllNamespaces('OciRepository', TelemetryError.FAILED_TO_GET_OCI_REPOSITORIES);
}

export async function getKustomizations(): Promise<Kustomization[]> {
	return getResourcesAllNamespaces('Kustomization', TelemetryError.FAILED_TO_GET_KUSTOMIZATIONS);
}

export async function getHelmReleases(): Promise<HelmRelease[]> {
	return getResourcesAllNamespaces('HelmRelease', TelemetryError.FAILED_TO_GET_HELM_RELEASES);
}

export async function getGitOpsTemplates(): Promise<GitOpsTemplate[]> {
	return getResourcesAllNamespaces('GitOpsTemplate', TelemetryError.FAILED_TO_GET_GITOPSTEMPLATES);
}


/**
 * Get all flux system deployments.
 */
export async function getFluxControllers(context?: string): Promise<Deployment[]> {
	const contextArg = context ? safesh`--context ${context}` : '';

	const fluxDeploymentShellResult = await invokeKubectlCommand(`get deployment --namespace=flux-system ${contextArg} -o json`);

	if (fluxDeploymentShellResult?.code !== 0) {
		console.warn(`Failed to get flux controllers: ${fluxDeploymentShellResult?.stderr}`);
		if (fluxDeploymentShellResult?.stderr && !notAnErrorServerNotRunning.test(fluxDeploymentShellResult.stderr)) {
			telemetry.sendError(TelemetryError.FAILED_TO_GET_FLUX_CONTROLLERS);
		}
		return [];
	}

	return parseJsonItems(fluxDeploymentShellResult.stdout);
}

/**
 * Return all available kubernetes resource kinds.
 */
export async function getAvailableResourceKinds(): Promise<string[] | undefined> {
	if (clusterSupportedResourceKinds) {
		return clusterSupportedResourceKinds;
	}

	const kindsShellResult = await invokeKubectlCommand('api-resources --verbs=list -o name');
	if (kindsShellResult?.code !== 0) {
		clusterSupportedResourceKinds = undefined;
		telemetry.sendError(TelemetryError.FAILED_TO_GET_AVAILABLE_RESOURCE_KINDS);
		console.warn(`Failed to get resource kinds: ${kindsShellResult?.stderr}`);
		return;
	}

	const kinds = kindsShellResult.stdout
		.split('\n')
		.filter(kind => kind.length);

	clusterSupportedResourceKinds = kinds;
	return kinds;
}

/**
 * Return all kubernetes resources that were created by a kustomize/helmRelease.
 * @param name name of the kustomize/helmRelease object
 * @param namespace namespace of the kustomize/helmRelease object
 */
export async function getChildrenOfWorkload(
	workload: 'kustomize' | 'helm',
	name: string,
	namespace: string,
): Promise<KubernetesObject[]> {
	const resourceKinds = await getAvailableResourceKinds();
	if (!resourceKinds) {
		return [];
	}

	const labelNameSelector = `-l ${workload}.toolkit.fluxcd.io/name=${name}`;
	const labelNamespaceSelector = `-l ${workload}.toolkit.fluxcd.io/namespace=${namespace}`;

	const query = `get ${resourceKinds.join(',')} ${labelNameSelector} ${labelNamespaceSelector} -A -o json`;
	const shellResult = await invokeKubectlCommand(query);

	if (!shellResult || shellResult.code !== 0) {
		telemetry.sendError(TelemetryError.FAILED_TO_GET_CHILDREN_OF_A_WORKLOAD);
		window.showErrorMessage(`Failed to get ${workload} created resources: ${shellResult?.stderr}`);
		return [];
	}

	return parseJsonItems(shellResult.stdout);
}


/**
 * Get pods by a deployment name.
 * @param name pod target name
 * @param namespace pod target namespace
 */
export async function getPodsOfADeployment(name = '', namespace = ''): Promise<Pod[]> {
	let nameArg: string;

	if (name === 'fluxconfig-agent' || name === 'fluxconfig-controller') {
		nameArg = name ? `-l app.kubernetes.io/component=${name}` : '';
	} else {
		nameArg = name ? `-l app=${name}` : '';
	}

	let namespaceArg = '';
	if (namespace === 'all') {
		namespaceArg = '--all-namespaces';
	} else if (namespace.length > 0) {
		namespaceArg = `--namespace=${namespace}`;
	}

	const podResult = await invokeKubectlCommand(`get pod ${nameArg} ${namespaceArg} -o json`);

	if (podResult?.code !== 0) {
		telemetry.sendError(TelemetryError.FAILED_TO_GET_PODS_OF_A_DEPLOYMENT);
		console.warn(`Failed to get pods: ${podResult?.stderr}`);
		return [];
	}

	return parseJsonItems(podResult?.stdout);
}

