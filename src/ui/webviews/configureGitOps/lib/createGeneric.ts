import { fluxTools } from 'cli/flux/fluxTools';
import { showDeployKeyNotificationIfNeeded } from 'commands/createSource';
import { refreshAllTreeViewsCommand } from 'commands/refreshTreeViews';
import { telemetry } from 'extension';
import { TelemetryEvent } from 'types/telemetryEventNames';
import { reloadSourcesTreeView } from 'ui/treeviews/treeViews';
import { ParamsDictionary } from 'utils/typeUtils';

export async function createConfigurationGeneric(data: ParamsDictionary) {
	telemetry.send(TelemetryEvent.CreateSource, {
		kind: data.source?.kind,
	});


	if(data.source) {
		const deployKey = await fluxTools.createSource(data.source);
		showDeployKeyNotificationIfNeeded(data.source.url, deployKey);
		setTimeout(() => {
			// Wait a bit for the repository to have a failed state in case of SSH url
			reloadSourcesTreeView();
		}, 1000);

	}

	if(data.kustomization) {
		await fluxTools.createKustomization(data.kustomization);
	}

	refreshAllTreeViewsCommand();
}
