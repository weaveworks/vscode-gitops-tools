import { getGitOpsTemplates } from 'cli/kubernetes/kubectlGet';
import { sortByMetadataName } from 'utils/sortByMetadataName';
import { GitOpsTemplateNode } from '../nodes/gitOpsTemplateNode';
import { DataProvider } from './dataProvider';

export class TemplateDataProvider extends DataProvider {

	async loadRootNodes() {
		const nodes = [];

		const templates = await getGitOpsTemplates();

		for (const template of sortByMetadataName(templates)) {
			nodes.push(new GitOpsTemplateNode(template));
		}

		this.nodes = nodes;
	}
}
