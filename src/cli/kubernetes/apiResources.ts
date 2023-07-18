import { telemetry } from 'extension';
import { TelemetryError } from 'types/telemetryEventNames';
import { invokeKubectlCommand } from './kubernetesToolsKubectl';
import { Kind } from 'types/kubernetes/kubernetesTypes';


type KindApiParams = {
	plural: string; // configmaps, deployments, gitrepositories, ...
	group: string; // '', apps, source.toolkit.fluxcd.io, ...
	version: string; // v1, v1beta2, ...
};

/*
 * Current cluster supported kubernetes resource kinds.
 */
let apiResources: Map<Kind, KindApiParams> | undefined;

/**
 * Return all available kubernetes resource kinds
 */
export function getAvailableResourceKinds(): Kind[] | undefined {
	if(apiResources) {
		return Object.keys(apiResources) as Kind[];
	}
}


export function getAPIParams(kind: Kind): KindApiParams | undefined {
	if(apiResources) {
		return apiResources.get(kind);
	}
}


export async function loadAvailableResourceKinds() {
	apiResources = undefined;

	const kindsShellResult = await invokeKubectlCommand('api-resources --verbs=list -o wide');
	if (kindsShellResult?.code !== 0) {
		telemetry.sendError(TelemetryError.FAILED_TO_GET_AVAILABLE_RESOURCE_KINDS);
		console.warn(`Failed to get resource kinds: ${kindsShellResult?.stderr}`);
		return;
	}

	const lines = kindsShellResult.stdout
		.split('\n')
		.filter(line => line.length).slice(1);

	apiResources = new Map<Kind, KindApiParams>();

	lines.map(line => {
		const cols = line.split(/\s+/);
		const kind = cols[4] as Kind;
		const plural = cols[0];
		const groupVersion = cols[2];
		let [group, version] = groupVersion.split('/');
		if(!version) {
			version = group;
			group = '';
		}
		apiResources?.set(kind, { plural, group, version });
	});

	console.log('apiResources loaded');
}
