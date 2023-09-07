import { redrawhResourcesTreeViews, refreshResourcesTreeViews } from 'commands/refreshTreeViews';
import { setVSCodeContext, telemetry } from 'extension';
import { createK8sClients } from 'k8s/client';
import { ContextId } from 'types/extensionIds';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { TelemetryError } from 'types/telemetryEventNames';
import { clusterDataProvider } from 'ui/treeviews/treeViews';
import { restartKubeProxy } from './kubectlProxy';
import { invokeKubectlCommand } from './kubernetesToolsKubectl';

export enum ApiState {
	Loading,
	Loaded,
	ClusterUnreachable,
}

type KindApiParams = {
	plural: string; // configmaps, deployments, gitrepositories, ...
	group: string; // '', apps, source.toolkit.fluxcd.io, ...
	version: string; // v1, v1beta2, ...
};

export let apiState: ApiState = ApiState.Loading;

/*
 * Current cluster supported kubernetes resource kinds.
 */
let apiResources: Map<Kind, KindApiParams> | undefined;

/**
 * Return all available kubernetes resource kinds
 */
export function getAvailableResourcePlurals(): string[] | undefined {
	const plurals: string[] = [];
	if(apiResources) {
		apiResources.forEach((value, key) => {
			plurals.push(value.plural);
		});

		return plurals;
	}
}


export function getAPIParams(kind: Kind): KindApiParams | undefined {
	if(apiResources) {
		return apiResources.get(kind);
	}
}


export async function loadAvailableResourceKinds() {
	apiResources = undefined;
	apiState = ApiState.Loading;
	// will set their content to Loading API...
	redrawhResourcesTreeViews();

	const kindsShellResult = await invokeKubectlCommand('api-resources --verbs=list -o wide');
	if (kindsShellResult?.code !== 0) {
		telemetry.sendError(TelemetryError.FAILED_TO_GET_AVAILABLE_RESOURCE_KINDS);
		console.warn(`Failed to get resource kinds: ${kindsShellResult?.stderr}`);
		apiState = ApiState.ClusterUnreachable;
		setVSCodeContext(ContextId.ClusterUnreachable, true);
		clusterDataProvider.updateCurrentContextChildNodes();
		refreshResourcesTreeViews();
		return;
	}

	const lines = kindsShellResult.stdout
		.split('\n')
		.filter(line => line.length).slice(1);

	apiResources = new Map<Kind, KindApiParams>();

	lines.map(line => {
		let cols = line.split(/\s+/);


		if(cols.length === 7) {
			// delete optional SHORTNAMES column
			cols = cols.slice(0, 1).concat(cols.slice(2));
		}
		const kind = cols[3] as Kind;
		const plural = cols[0];
		const groupVersion = cols[1];
		let [group, version] = groupVersion.split('/');
		if(!version) {
			version = group;
			group = '';
		}
		apiResources?.set(kind, { plural, group, version });
	});

	console.log('apiResources loaded');

	apiState = ApiState.Loaded;
	redrawhResourcesTreeViews();
	setVSCodeContext(ContextId.ClusterUnreachable, false);
	clusterDataProvider.updateCurrentContextChildNodes();

	await restartKubeProxy();

	// give proxy init callbacks time to fire
	setTimeout(() => {
		refreshResourcesTreeViews();
	}, 100);
}
