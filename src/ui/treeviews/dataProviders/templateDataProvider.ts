import { getGitOpsTemplates } from 'cli/kubernetes/kubectlGet';
import { ContextData } from 'data/contextData';
import { sortByMetadataName } from 'utils/sortByMetadataName';
import { GitOpsTemplateNode } from '../nodes/gitOpsTemplateNode';
import { AsyncDataProvider } from './asyncDataProvider';

export class TemplateDataProvider extends AsyncDataProvider {
	protected viewData(contextData: ContextData) {
		return contextData.viewData.template;
	}

	async loadRootNodes() {
		const nodes = [];

		const templates = await getGitOpsTemplates();

		for (const template of sortByMetadataName(templates)) {
			nodes.push(new GitOpsTemplateNode(template));
		}

		return nodes;
	}
}
