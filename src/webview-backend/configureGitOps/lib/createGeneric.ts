import { createGitRepositoryGenericCluster } from '../../../commands/createSource';
import { telemetry } from '../../../extension';
import { CreateSourceGitGenericArgs, fluxTools } from '../../../flux/fluxTools';
import { TelemetryEventNames } from '../../../telemetry';
import { ParamsDictionary } from '../../../utils/typeUtils';
import { refreshAllTreeViews, refreshSourcesTreeView } from '../../../views/treeViews';

export async function createConfigurationGeneric(data: ParamsDictionary) {
	telemetry.send(TelemetryEventNames.CreateSource, {
		kind: data.source?.kind,
	});


	if(data.source?.kind) {
		switch(data.source.kind) {
			case 'GitRepository':
				await createGitRepository(data);
				break;
			case 'OCIRepository':
				await createOCIRepository(data);
				break;
		}
	}

	if(data.kustomization) {
		createKustomization(data);
	}

	refreshAllTreeViews();
}


async function createGitRepository(data: ParamsDictionary) {
	const source = data.source;

	const args: CreateSourceGitGenericArgs = {
		sourceName: source.name,
		url: source.gitUrl,
		...source,
	};
	await createGitRepositoryGenericCluster(args);
}

async function createOCIRepository(data: ParamsDictionary) {
	const source = data.source;

	const args: CreateSourceGitGenericArgs = {
		sourceName: source.name,
		url: source.ociUrl,
		...source,
	};

	await fluxTools.createSourceOCI(args);
	refreshSourcesTreeView();
}

async function createKustomization(data: ParamsDictionary) {
	const source = data.source;
	const kustomization = data.kustomization;

	let sourceRef = source ? `${source.kind}/${source.name}` : data.selectedSource;
	await fluxTools.createKustomization(kustomization.name, sourceRef, kustomization.path,
		kustomization.namespace, kustomization.targetNamespace,
		kustomization.dependsOn, kustomization.prune);
}
