import { createEffect, For } from 'solid-js';
import { selectedSource, setSelectedSource } from '../../lib/model';
import { bindChangeValueSignal } from '../../lib/bindDirectives'; bindChangeValueSignal; // TS will elide 'unused' imports

import { params } from '../../lib/params';
import { debug } from '../../utils/debug';


createEffect(() => {
	debug(`selectedSource()=${selectedSource()}`);
});

function createOption(name: string, i: any) {
	if(i() === 0 && selectedSource() === '') {
		setSelectedSource(name);
	}

	// TODO: add namespace and kind
	return <vscode-option>{name}</vscode-option>;
}

function SelectSource() {
	return (
		<div>
			<vscode-dropdown use:bindChangeValueSignal={[selectedSource, setSelectedSource]} position="below" class="medium">
				<For each={params.sources}>
					{(name: string, i: any) => createOption(name, i)}
				</For>

			</vscode-dropdown>
		</div>
	);
}

export default SelectSource;
