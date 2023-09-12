import { redrawResourcesTreeViews, refreshResourcesTreeViews } from 'commands/refreshTreeViews';
import { currentContextData } from 'data/contextData';
import { setVSCodeContext, telemetry } from 'extension';
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

export type KindApiParams = {
	plural: string; // configmaps, deployments, gitrepositories, ...
	group: string; // '', apps, source.toolkit.fluxcd.io, ...
	version: string; // v1, v1beta2, ...
};



/**
 * Return all available kubernetes resource kinds
 */
export function getAvailableResourcePlurals(): string[] | undefined {
	const context = currentContextData();
	const plurals: string[] = [];
	if(context.apiResources) {
		context.apiResources.forEach((value, key) => {
			plurals.push(value.plural);
		});

		return plurals;
	}
}


export function getAPIParams(kind: Kind): KindApiParams | undefined {
	const context = currentContextData();

	if(context.apiResources) {
		return context.apiResources.get(kind);
	}
}


export async function loadAvailableResourceKinds() {
	const context = currentContextData();
	context.apiResources = undefined;
	context.apiState = ApiState.Loading;
	// will set their content to Loading API...
	redrawResourcesTreeViews();

	const kindsShellResult = await invokeKubectlCommand('api-resources --verbs=list -o wide');
	if (kindsShellResult?.code !== 0) {
		telemetry.sendError(TelemetryError.FAILED_TO_GET_AVAILABLE_RESOURCE_KINDS);
		console.warn(`Failed to get resource kinds: ${kindsShellResult?.stderr}`);
		context.apiState = ApiState.ClusterUnreachable;
		setVSCodeContext(ContextId.ClusterUnreachable, true);
		clusterDataProvider.updateCurrentContextChildNodes();
		refreshResourcesTreeViews();
		redrawResourcesTreeViews();
		return;
	}

	const lines = kindsShellResult.stdout
		.split('\n')
		.filter(line => line.length).slice(1);

	context.apiResources = new Map<Kind, KindApiParams>();

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
		context.apiResources?.set(kind, { plural, group, version });
	});

	console.log('apiResources loaded');

	context.apiState = ApiState.Loaded;
	setVSCodeContext(ContextId.ClusterUnreachable, false);
	clusterDataProvider.updateCurrentContextChildNodes();

	await restartKubeProxy();

	// give proxy init callbacks time to fire
	setTimeout(() => {
		refreshResourcesTreeViews();
	}, 100);
}
