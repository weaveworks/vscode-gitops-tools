import { getGitOpsTemplates } from 'cli/kubernetes/kubectlGet';
import { ContextData } from 'data/contextData';
import { CommonIcon } from 'ui/icons';
import { sortByMetadataName } from 'utils/sortByMetadataName';
import { TreeNode } from '../nodes/treeNode';
import { GitOpsTemplateNode } from '../nodes/wge/gitOpsTemplateNode';
import { AsyncDataProvider } from './asyncDataProvider';

export class WgeDataProvider extends AsyncDataProvider {
	protected viewData(contextData: ContextData) {
		return contextData.viewData.template;
	}

	async loadRootNodes() {
		const nodes = [];



		const templates = new TreeNode('Templates');
		templates.setCommonIcon(CommonIcon.Disconnected);
		templates.makeCollapsible();

		nodes.push(templates);

		const goTemplates = await getGitOpsTemplates();

		for (const template of sortByMetadataName(goTemplates)) {
			templates.children.push(new GitOpsTemplateNode(template));
		}

		return nodes;
	}
}
