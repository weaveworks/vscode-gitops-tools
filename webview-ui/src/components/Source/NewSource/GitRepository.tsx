import { onMount } from 'solid-js';
import { bindChangeValueFunc, bindInputStore } from '../../../lib/bindDirectives';
bindChangeValueFunc; bindInputStore; // TS will elide 'unused' imports

import { setSource, source } from '../../../lib/model';
import SettingsPanel from './Settings/GitRepository/Panel';
import Name from './Source/Name';
import Namespace from './Source/Namespace';


const setRefType = (val: string) => setSource('gitRefType', val);

function GitRepository() {
	return (
		<div>
			<Name/>
			<Namespace/>

			<div>
				<label>Repository URL</label>
				<input use:bindInputStore={[source, setSource, 'gitUrl']} class="long"></input>
			</div>

			<div>
				<label>Reference</label>
				<div class="flex-row">
					<vscode-dropdown use:bindChangeValueFunc={setRefType}>
						<vscode-option>branch</vscode-option>
						<vscode-option>tag</vscode-option>
						<vscode-option>semver</vscode-option>
					</vscode-dropdown>
					<input use:bindInputStore={[source, setSource, 'gitRef']} style="margin-left: 4px; width: 23rem !important"></input>
				</div>
			</div>

			<SettingsPanel/>
		</div>


	);
}

export default GitRepository;
