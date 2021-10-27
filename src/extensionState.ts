interface ExtensionStateMap {
	fluxVersion: string;
}

type ExtensionStateKey = keyof ExtensionStateMap;

class ExtensionState {
	/**
	 * All the items of the global state.
	 */
	private state: ExtensionStateMap = {
		fluxVersion: 'Not installed',
	};


	get<T extends ExtensionStateKey>(stateKey: T): ExtensionStateMap[T] {
		return this.state[stateKey];
	}

	set<T extends ExtensionStateKey>(stateKey: T, newValue: ExtensionStateMap[T]): void {
		this.state[stateKey] = newValue;
	}
}

/**
 * Global state (temporary, while extension is running).
 */
export const extensionState = new ExtensionState();

