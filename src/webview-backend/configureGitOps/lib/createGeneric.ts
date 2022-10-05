import { showDeployKeyNotificationIfNeeded } from '../../../commands/createSource';
import { telemetry } from '../../../extension';
import { fluxTools } from '../../../flux/fluxTools';
import { TelemetryEventNames } from '../../../telemetry';
import { ParamsDictionary } from '../../../utils/typeUtils';
import { refreshAllTreeViews, refreshSourcesTreeView } from '../../../views/treeViews';

export async function createConfigurationGeneric(data: ParamsDictionary) {
	telemetry.send(TelemetryEventNames.CreateSource, {
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

	refreshAllTreeViews();
}
