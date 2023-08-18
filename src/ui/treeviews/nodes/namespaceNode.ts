import { Kind, Namespace } from 'types/kubernetes/kubernetesTypes';
import { TreeNode, TreeNodeIcon } from './treeNode';
import { TreeItemCollapsibleState } from 'vscode';
import { SourceNode } from './source/sourceNode';
import { WorkloadNode } from './workload/workloadNode';
import { read } from 'fs';

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

	updateLabel() {
		if(this.collapsibleState === TreeItemCollapsibleState.Collapsed) {
			const totalLength = this.children.length;
			let readyLength = 0;
			for(const child of this.children) {
				if(child instanceof SourceNode || child instanceof WorkloadNode) {
					if(!child.isReconcileFailed) {
						readyLength++;
					}
				} else {
					readyLength++;
				}
			}
			const lengthLabel = totalLength === readyLength ? `${totalLength}` : `${readyLength}/${totalLength}`;
			this.label = `${this.resource.metadata?.name} (${lengthLabel})`;

			if(readyLength === totalLength) {
				this.setIcon(TreeNodeIcon.Success);
			} else {
				this.setIcon(TreeNodeIcon.Error);
			}
		} else {
			this.label = `${this.resource.metadata?.name}`;
		}
	}
}
