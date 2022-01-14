import { window, workspace } from 'vscode';
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

class GlobalState {

	private prefix(prefixValue: GlobalStatePrefixes, str: string): string {
		return `${prefixValue}:${str}`;
	}

	get(stateKey: string) {
		return getExtensionContext().globalState.get(stateKey);
	}

	set(stateKey: string, newValue: any): void {
		getExtensionContext().globalState.update(stateKey, newValue);
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
			content: JSON.stringify(getExtensionContext().globalState._value, null, '  '),
		});
		window.showTextDocument(document);
	}

	/**
	 * Dev function (clear all global state properties).
	 */
	clearGlobalState() {
		for (const key of getExtensionContext().globalState.keys()) {
			this.set(key, undefined);
		}
	}
}

/**
 * Global state (saved in vscode global storage).
 */
export const globalState = new GlobalState();
