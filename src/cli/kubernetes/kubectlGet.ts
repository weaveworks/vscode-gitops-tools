import safesh from 'shell-escape-tag';

import { telemetry } from 'extension';
import { k8sGet, k8sList } from 'k8s/list';
import { Bucket } from 'types/flux/bucket';
import { Canary } from 'types/flux/canary';
import { GitOpsTemplate } from 'types/flux/gitOpsTemplate';
import { GitRepository } from 'types/flux/gitRepository';
import { GitOpsSet } from 'types/flux/gitopsset';
import { HelmRelease } from 'types/flux/helmRelease';
import { HelmRepository } from 'types/flux/helmRepository';
import { Kustomization } from 'types/flux/kustomization';
import { OCIRepository } from 'types/flux/ociRepository';
import { Pipeline } from 'types/flux/pipeline';
import { Deployment, Kind, KubernetesObject, Pod, qualifyToolkitKind } from 'types/kubernetes/kubernetesTypes';
import { TelemetryError } from 'types/telemetryEventNames';
import { parseJson, parseJsonItems } from 'utils/jsonUtils';
import { window } from 'vscode';
import { getAvailableResourcePlurals } from './apiResources';
import { invokeKubectlCommand } from './kubernetesToolsKubectl';
/**
 * RegExp for the Error that should not be sent in telemetry.
 * Server doesn't have a resource type = when GitOps not enabled
 * No connection could be made... = when cluster not running
 */
export const notAnErrorServerDoesntHaveResourceTypeRegExp = /the server doesn't have a resource type/i;
export const notAnErrorServerNotRunning = /no connection could be made because the target machine actively refused it/i;

/**
 * Get one resource object by kind/name and namespace
 * @param name name of the target resource
 * @param namespace namespace of the target resource
 * @param kind kind of the target resource
 */
export async function getResource<T extends KubernetesObject>(name: string, namespace: string, kind: Kind): Promise<undefined | T> {
	const item = await k8sGet(name, namespace, kind);
	if(item) {
		return item as T;
	}

	let fqKind = qualifyToolkitKind(kind);

	const shellResult = await invokeKubectlCommand(`get ${fqKind}/${name} --namespace=${namespace} -o json`);
	if (shellResult?.code !== 0) {
		telemetry.sendError(TelemetryError.FAILED_TO_GET_RESOURCE);
		return;
	}

	return parseJson(shellResult.stdout) as T;
}

export async function getResourcesAllNamespaces<T extends KubernetesObject>(kind: Kind, telemetryError: TelemetryError): Promise<T[]> {
	const list = await k8sList(kind);
	if(list !== undefined) {
		return list as T[];
	}

	let fqKind = qualifyToolkitKind(kind);

	const shellResult = await invokeKubectlCommand(`get ${fqKind} -A -o json`);
	if (shellResult?.code !== 0) {
		console.warn(`Failed to \`kubectl get ${kind} -A\`: ${shellResult?.stderr}`);
		if (shellResult?.stderr && !notAnErrorServerDoesntHaveResourceTypeRegExp.test(shellResult.stderr)) {
			telemetry.sendError(telemetryError);
		}
		return [];
	}

	const items = parseJsonItems(shellResult.stdout);
	return items as T[];
}


export async function getBuckets(): Promise<Bucket[]> {
	return getResourcesAllNamespaces(Kind.Bucket, TelemetryError.FAILED_TO_GET_BUCKETS);
}

export async function getGitRepositories(): Promise<GitRepository[]> {
	return getResourcesAllNamespaces(Kind.GitRepository, TelemetryError.FAILED_TO_GET_GIT_REPOSITORIES);
}

export async function getHelmRepositories(): Promise<HelmRepository[]> {
	return getResourcesAllNamespaces(Kind.HelmRepository, TelemetryError.FAILED_TO_GET_HELM_REPOSITORIES);
}

export async function getOciRepositories(): Promise<OCIRepository[]> {
	return getResourcesAllNamespaces(Kind.OCIRepository, TelemetryError.FAILED_TO_GET_OCI_REPOSITORIES);
}

export async function getKustomizations(): Promise<Kustomization[]> {
	return getResourcesAllNamespaces(Kind.Kustomization, TelemetryError.FAILED_TO_GET_KUSTOMIZATIONS);
}

export async function getHelmReleases(): Promise<HelmRelease[]> {
	return getResourcesAllNamespaces(Kind.HelmRelease, TelemetryError.FAILED_TO_GET_HELM_RELEASES);
}

export async function getGitOpsTemplates(): Promise<GitOpsTemplate[]> {
	return getResourcesAllNamespaces(Kind.GitOpsTemplate, TelemetryError.FAILED_TO_GET_GITOPSTEMPLATES);
}

export async function getCanaries(): Promise<Canary[]> {
	return getResourcesAllNamespaces(Kind.Canary, TelemetryError.FAILED_TO_GET_HELM_RELEASES);
}

export async function getPipelines(): Promise<Pipeline[]> {
	return getResourcesAllNamespaces(Kind.Pipeline, TelemetryError.FAILED_TO_GET_HELM_RELEASES);
}

export async function getGitOpsSet(): Promise<GitOpsSet[]> {
	return getResourcesAllNamespaces(Kind.GitOpsSet, TelemetryError.FAILED_TO_GET_HELM_RELEASES);
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
 * Return all kubernetes resources that were created by a kustomize/helmRelease.
 * @param name name of the kustomize/helmRelease object
 * @param namespace namespace of the kustomize/helmRelease object
 */
export async function getHelmReleaseChildren(
	name: string,
	namespace: string,
): Promise<KubernetesObject[] | undefined> {
	// return [];
	const resourceKinds = getAvailableResourcePlurals();
	if (!resourceKinds) {
		return;
	}

	const labelNameSelector = `-l helm.toolkit.fluxcd.io/name=${name}`;
	const labelNamespaceSelector = `-l helm.toolkit.fluxcd.io/namespace=${namespace}`;

	const query = `get ${resourceKinds.join(',')} ${labelNameSelector} ${labelNamespaceSelector} -A -o json`;
	const shellResult = await invokeKubectlCommand(query);

	if (!shellResult || shellResult.code !== 0) {
		telemetry.sendError(TelemetryError.FAILED_TO_GET_CHILDREN_OF_A_WORKLOAD);
		window.showErrorMessage(`Failed to get HelmRelease created resources: ${shellResult?.stderr}`);
		return;
	}

	return parseJsonItems(shellResult.stdout);
}


export async function getCanaryChildren(
	name: string,
): Promise<KubernetesObject[]> {
	// return [];
	const resourceKinds = getAvailableResourcePlurals();
	if (!resourceKinds) {
		return [];
	}

	const labelNameSelector = `-l app=${name}`;

	const query = `get ${resourceKinds.join(',')} ${labelNameSelector} -A -o json`;
	const shellResult = await invokeKubectlCommand(query);

	if (!shellResult || shellResult.code !== 0) {
		telemetry.sendError(TelemetryError.FAILED_TO_GET_CHILDREN_OF_A_WORKLOAD);
		window.showErrorMessage(`Failed to get HelmRelease created resources: ${shellResult?.stderr}`);
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
