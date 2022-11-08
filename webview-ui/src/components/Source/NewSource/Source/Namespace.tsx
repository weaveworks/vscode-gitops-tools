import { createEffect, For, onMount } from 'solid-js';

import { Select } from '@microsoft/fast-foundation';

import { setSource, source } from '../../../../lib/model';
import { params } from '../../../../lib/params';

import { bindChangeValueFunc } from '../../../../lib/bindDirectives';
bindChangeValueFunc; // TS will elide 'unused' imports


let nsDropdown: Select;

const setNamespace = (val: string) => setSource('namespace', val);

function Namespace() {
	onMount(() => {
		console.log(nsDropdown);
		console.log(source.namespace);
		nsDropdown.currentValue = source.namespace;
	});

	return (
		<div>
			<label>Namespace</label>
			<div>
				<vscode-dropdown ref={nsDropdown} use:bindChangeValueFunc={setNamespace} class="medium">
					<For each={params.namespaces}>{(name, i) =>
						<vscode-option>{name}</vscode-option>
					}
					</For>
				</vscode-dropdown>
			</div>
		</div>
	);
}

export default Namespace;
