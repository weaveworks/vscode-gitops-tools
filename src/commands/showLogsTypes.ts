import { QuickPickItem, Uri } from 'vscode';

import { V1ObjectMeta } from '@kubernetes/client-node';

export class ResourceKind implements QuickPickItem {
	constructor(readonly displayName: string, readonly pluralDisplayName: string,
		readonly manifestKind: string, readonly abbreviation: string, readonly apiName?: string) {
	}

	get label() {
		return this.displayName;
	}
	get description() {
		return '';
	}
}

export interface ResourceNode {
	readonly nodeType: 'resource';
	readonly name?: string;
	readonly namespace?: string;
	readonly kindName: string;
	readonly metadata: V1ObjectMeta;
	readonly kind: ResourceKind;
	uri(outputFormat: string): Uri;
}

export const podResourceKind = new ResourceKind('Pod', 'Pods', 'Pod', 'pod', 'pods');
