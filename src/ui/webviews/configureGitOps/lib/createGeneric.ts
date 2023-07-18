import { showDeployKeyNotificationIfNeeded } from 'commands/createSource';
import { telemetry } from 'extension';
import { fluxTools } from 'cli/flux/fluxTools';
import { TelemetryEvent } from 'types/telemetryEventNames';
import { ParamsDictionary } from 'utils/typeUtils';
import { refreshSourcesTreeView } from 'ui/treeviews/treeViews';
import { refreshAllTreeViewsCommand } from 'commands/refreshTreeViews';

export async function createConfigurationGeneric(data: ParamsDictionary) {
	telemetry.send(TelemetryEvent.CreateSource, {
		kind: data.source?.kind,
	});


	if(data.source) {
		const deployKey = await fluxTools.createSource(data.source);
		showDeployKeyNotificationIfNeeded(data.source.url, deployKey);
		setTimeout(() => {
			// Wait a bit for the repository to have a failed state in case of SSH url
			refreshSourcesTreeView();
		}, 1000);

	}

	if(data.kustomization) {
		await fluxTools.createKustomization(data.kustomization);
	}

	refreshAllTreeViewsCommand();
}
