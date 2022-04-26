import { ExtensionContext, window, workspace } from 'vscode';
import { kubernetesTools } from './kubernetes/kubernetesTools';
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

export const enum GlobalStateKey {
	FluxPath = 'fluxPath',
	FirstEverActivationStorageKey = 'firstEverActivation',
}

interface GlobalStateKeyMapping {
	[GlobalStateKey.FluxPath]: string;
	[GlobalStateKey.FirstEverActivationStorageKey]: boolean;
}

export class GlobalState {

	constructor(private context: ExtensionContext) {}

	private prefix(prefixValue: GlobalStatePrefixes, str: string): string {
		return `${prefixValue}:${str}`;
	}

	get<T extends GlobalStateKeyMapping, E extends keyof T>(stateKey: E): T[E] | undefined {
		return this.context.globalState.get(stateKey as string);
	}

	set<T extends GlobalStateKeyMapping, E extends keyof T>(stateKey: E, newValue: T[E]): void {
		this.context.globalState.update(stateKey as string, newValue);
	}

	getClusterMetadata(clusterName: string): ClusterMetadata | undefined {
		return this.context.globalState.get(this.prefix(GlobalStatePrefixes.ClusterMetadata, clusterName));
	}

	async getContextClusterMetadata(contextName: string): Promise<ClusterMetadata | undefined> {
		const clusterName = await kubernetesTools.getClusterName(contextName);
		return this.getClusterMetadata(clusterName || contextName);
	}

	setClusterMetadata(clusterName: string, metadata: ClusterMetadata): void {
		this.context.globalState.update(this.prefix(GlobalStatePrefixes.ClusterMetadata, clusterName), metadata);
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
			this.context.globalState.update(key, undefined);
		}
	}
}

