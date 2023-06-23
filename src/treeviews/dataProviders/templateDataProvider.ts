import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { sortByMetadataName } from '../../kubernetes/kubernetesUtils';
import { GitOpsTemplate } from '../../types/flux/gitOpsTemplate';
import { GitOpsTemplateNode } from '../nodes/gitOpsTemplateNode';
import { DataProvider } from './dataProvider';

export class TemplateDataProvider extends DataProvider {

	async buildTree(): Promise<GitOpsTemplateNode[]> {
		const nodes = [];

		const templates = await kubernetesTools.getGitOpsTemplates();

		if(templates) {
			for (const template of sortByMetadataName(templates.items)) {
				nodes.push(new GitOpsTemplateNode(template));
			}
		}

		return nodes;
	}
}
