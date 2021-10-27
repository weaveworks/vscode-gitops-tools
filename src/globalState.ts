import { ExtensionContext } from 'vscode';
import { getExtensionContext } from './extensionContext';

export interface ClusterAzureMetadata {
	azureResourceGroup: string;
	azureSubscription: string;
}

const enum GlobalStatePrefixes {
	ClusterMetadata = 'clusterMetadata',
}

class GlobalState {

	constructor(private extensionContext: ExtensionContext) {}

	get(stateKey: string) {
		return this.extensionContext.globalState.get(stateKey);
	}

	set(stateKey: string, newValue: any): void {
		this.extensionContext.globalState.update(stateKey, newValue);
	}

	getClusterMetadata(clusterName: string): ClusterAzureMetadata | undefined {
		return this.get(GlobalStatePrefixes.ClusterMetadata + clusterName) as ClusterAzureMetadata | undefined;
	}

	setClusterMetadata(clusterName: string, metadata: ClusterAzureMetadata) {
		this.set(GlobalStatePrefixes.ClusterMetadata + clusterName, metadata);
	}
}

/**
 * Global state (saved in vscode global storage).
 */
export const globalState = new GlobalState(getExtensionContext());
