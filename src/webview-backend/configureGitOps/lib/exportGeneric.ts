import { window, workspace } from 'vscode';
import { telemetry } from '../../../extension';
import { CreateSourceGitGenericArgs, fluxTools } from '../../../flux/fluxTools';
import { TelemetryErrorEventNames, TelemetryEventNames } from '../../../telemetry';
import { ParamsDictionary } from '../../../utils/typeUtils';

export async function exportConfigurationGeneric(data: ParamsDictionary) {
	telemetry.send(TelemetryEventNames.ExportSource, {
		kind: data.source?.kind,
	});

	let yaml = '';

	if(data.source?.kind) {
		switch(data.source.kind) {
			case 'GitRepository':
				yaml += await exportGitRepository(data);
				break;
			case 'OCIRepository':
				yaml += await exportOCIRepository(data);
				break;
		}
	}

	if(data.kustomization) {
		yaml += await exportKustomization(data);
	}

	showYaml(yaml);
}




async function exportGitRepository(data: ParamsDictionary) {
	const source = data.source;

	const args: CreateSourceGitGenericArgs = {
		sourceName: source.name,
		url: source.gitUrl,
		...source,
	};
	return await fluxTools.exportSourceGit(args);
}

async function exportOCIRepository(data: ParamsDictionary) {
	const source = data.source;

	const args: CreateSourceGitGenericArgs = {
		sourceName: source.name,
		url: source.ociUrl,
		...source,
	};

	return await fluxTools.exportSourceOCI(args);
}

async function exportKustomization(data: ParamsDictionary) {
	const source = data.source;
	const kustomization = data.kustomization;

	let sourceRef = source ? `${source.kind}/${source.name}` : data.selectedSource;
	return await fluxTools.exportKustomization(kustomization.name, sourceRef, kustomization.path,
		kustomization.namespace, kustomization.targetNamespace,
		kustomization.dependsOn, kustomization.prune);
}


async function showYaml(text: string) {
	return await workspace.openTextDocument({content: text} ).then(document => {
		if (document) {
			// document['languageId'] =
			window.showTextDocument(document);
		}
	},
	error =>  {
		window.showErrorMessage(`Error loading document: ${error}`);
		telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_OPEN_RESOURCE);
	});
}


