import { Kind, Namespace } from 'types/kubernetes/kubernetesTypes';
import { CommonIcon } from 'ui/icons';
import { TreeItemCollapsibleState } from 'vscode';
import { SourceNode } from './source/sourceNode';
import { TreeNode } from './treeNode';
import { WorkloadNode } from './workload/workloadNode';

/**
 * Defines any kubernetes resourse.
 */
export class NamespaceNode extends TreeNode {

	/**
	 * kubernetes resource metadata
	 */
	resource: Namespace;

	constructor(namespace: Namespace) {
		super(namespace.metadata?.name || '');

		this.description = Kind.Namespace;

		this.resource = namespace;
	}

	get contexts() {
		return [Kind.Namespace];
	}

	updateLabel(withIcons = true) {
		const totalLength = this.children.length;
		let readyLength = 0;
		let loadingLength = 0;
		for(const child of this.children) {
			if(child instanceof SourceNode || child instanceof WorkloadNode) {
				if(child.resourceIsReady) {
					readyLength++;
				} else if(child.resourceIsProgressing) {
					loadingLength++;
				}
			} else {
				readyLength++;
			}
		}

		const validLength = readyLength + loadingLength;
		if(withIcons) {
			if(readyLength === totalLength) {
				this.setCommonIcon(CommonIcon.Success);
			} else if(validLength === totalLength) {
				this.setCommonIcon(CommonIcon.Progressing);
			} else {
				this.setCommonIcon(CommonIcon.Warning);
			}
		} else {
			this.setIcon(undefined);
		}

		if(this.collapsibleState === TreeItemCollapsibleState.Collapsed) {
			const lengthLabel = totalLength === validLength ? `${totalLength}` : `${validLength}/${totalLength}`;
			this.label = `${this.resource.metadata?.name} (${lengthLabel})`;
		} else {
			this.label = `${this.resource.metadata?.name}`;
		}
	}
}
