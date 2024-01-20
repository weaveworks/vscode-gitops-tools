import { openConfigureGitOpsWebview } from 'ui/webviews/configureGitOps/openWebview';
import { SourceNode } from 'ui/treeviews/nodes/source/sourceNode';
import { FluxSourceKinds } from 'types/flux/object';

/**
 * Open ConfigureGitops webview with a source preselected (if user right-clicked a source node)
 * @param sourceNode user right-clicked this in the Sources treeview
 */
export async function addKustomization(sourceNode?: SourceNode) {
	let sourceObject = sourceNode?.resource;

	// when Workloads '+' button is clicked (instead of right-clicking a Source treeview item)
	// sourceNode resource will be the first object in Workloads view (for example an Kustomization)
	// the type checker does not know this
	if(sourceObject?.kind && !FluxSourceKinds.includes(sourceObject?.kind)) {
		sourceObject = undefined;
	}

	openConfigureGitOpsWebview(true, sourceObject);
}
