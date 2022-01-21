import { ExtensionContext, window, workspace } from 'vscode';
import { getExtensionContext } from './extensionContext';
import { KnownClusterProviders } from './kubernetes/kubernetesTypes';

export interface ClusterMetadata {
	azureResourceGroup?: string;
	azureSubscription?: string;
	azureClusterName?: string;
	clusterProvider?: KnownClusterProviders;
}

const enum GlobalStatePrefixes {
	ClusterMetadata = 'clusterMetadata',
}

// TODO: use globalState instead of getExtensionContext().globalState everywhere
export class GlobalState {

	constructor(private context: ExtensionContext) {}

	private prefix(prefixValue: GlobalStatePrefixes, str: string): string {
		return `${prefixValue}:${str}`;
	}

	get(stateKey: string) {
		return this.context.globalState.get(stateKey);
	}

	set(stateKey: string, newValue: any): void {
		this.context.globalState.update(stateKey, newValue);
	}

	getClusterMetadata(clusterName: string): ClusterMetadata | undefined {
		return this.get(this.prefix(GlobalStatePrefixes.ClusterMetadata, clusterName)) as ClusterMetadata | undefined;
	}

	setClusterMetadata(clusterName: string, metadata: ClusterMetadata): void {
		this.set(this.prefix(GlobalStatePrefixes.ClusterMetadata, clusterName), metadata);
	}

	/**
	 * Run while developing to see the entire global storage contents.
	 */
	async showGlobalStateValue() {
		const document = await workspace.openTextDocument({
			language: 'jsonc',
			// @ts-ignore
			content: JSON.stringify(this.context.globalState._value, null, '  '),
		});
		window.showTextDocument(document);
	}

	/**
	 * Dev function (clear all global state properties).
	 */
	clearGlobalState() {
		for (const key of this.context.globalState.keys()) {
			this.set(key, undefined);
		}
	}
}

