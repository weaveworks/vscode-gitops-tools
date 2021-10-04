import { QuickPickItem } from 'vscode';

export class ResourceKind implements QuickPickItem {
	constructor(readonly displayName: string, readonly pluralDisplayName: string, readonly manifestKind: string, readonly abbreviation: string, readonly apiName?: string) {
	}

	get label() {
		return this.displayName;
	}
	get description() {
		return '';
	}
}
