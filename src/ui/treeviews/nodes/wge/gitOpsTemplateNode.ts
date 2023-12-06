import { MarkdownString } from 'vscode';

import { GitOpsTemplate } from 'types/flux/gitOpsTemplate';
import { NodeContext } from 'types/nodeContext';
import { themeIcon } from 'ui/icons';
import { wgeDataProvider } from 'ui/treeviews/treeViews';
import { createMarkdownTable } from 'utils/markdownUtils';
import { KubernetesObjectNode } from '../kubernetesObjectNode';

export enum TemplateType {
	Cluster = 'cluster',
	Application = 'application',
	Pipeline = 'pipeline',
}

export class GitOpsTemplateNode extends KubernetesObjectNode {
	resource: GitOpsTemplate;

	constructor(template: GitOpsTemplate) {
		super(template, template.metadata.name, wgeDataProvider);

		this.resource = template;

		if(this.templateType === 'cluster') {
			this.setIcon(themeIcon('server-environment', 'descriptionForeground'));
		} else if (this.templateType === 'application') {
			this.setIcon(themeIcon('preview', 'descriptionForeground'));
		} else if (this.templateType === 'pipeline') {
			this.setIcon(themeIcon('rocket', 'descriptionForeground'));

		}
		this.makeUncollapsible();
	}

	get tooltip() {
		return this.getMarkdownHover(this.resource);
	}

	get templateType(): TemplateType {
		switch(this.resource.metadata.labels?.['weave.works/template-type']){
			case 'cluster':
				return TemplateType.Cluster;
			case 'application':
				return TemplateType.Application;
			case 'pipeline':
				return TemplateType.Pipeline;
			default:
				return TemplateType.Application;
		}
	}

	// @ts-ignore
	get description() {
		return false;
	}

	getMarkdownHover(template: GitOpsTemplate): MarkdownString {
		const markdown: MarkdownString = createMarkdownTable(template);
		return markdown;
	}

	get contexts() {
		return [NodeContext.HasWgePortal];
	}


	get wgePortalQuery() {
		const name = this.resource.metadata.name;
		const namespace = this.resource.metadata.namespace || 'default';


		return `templates/create?name=${name}&namespace=${namespace}`;
	}


}
