import { For, onMount } from 'solid-js';
import { params } from '../../../lib/params';
import { bindChangeValueFunc, bindInputStore } from '../../../lib/bindDirectives'; bindChangeValueFunc; bindInputStore;// TS will elide 'unused' imports

import NewGitAdvanced from './NewGitRepository/Advanced';
import { setSource, source } from '../../../lib/model';
import { Select } from '@microsoft/fast-foundation';

let nsDropdown: Select;

const setNamespace = (val: string) => setSource('namespace', val);
const setRefType = (val: string) => setSource('refType', val);

function NewGitRepository() {
	onMount(() => {
		nsDropdown.currentValue = source.namespace;
	});
	return (
		<div>
			<div>
				<label><code>GitRepository</code> Name</label>
				<input use:bindInputStore={[source, setSource, 'name']} class="medium"></input>
			</div>
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
			<div>
				<label>Repository URL</label>
				<input use:bindInputStore={[source, setSource, 'url']} class="long"></input>
			</div>

			<div>
				<label>Reference</label>
				<div class="flex-row">
					<vscode-dropdown use:bindChangeValueFunc={setRefType}>
						<vscode-option>branch</vscode-option>
						<vscode-option>tag</vscode-option>
						<vscode-option>semver</vscode-option>
					</vscode-dropdown>
					<input use:bindInputStore={[source, setSource, 'ref']} style="margin-left: 4px; width: 23rem !important"></input>
				</div>
			</div>

			<div>
				<NewGitAdvanced/>
			</div>
		</div>


	);
}

export default NewGitRepository;
