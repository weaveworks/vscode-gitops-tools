

import { bindChangeValueFunc, bindInputStore } from '../../../lib/bindDirectives';
bindChangeValueFunc; bindInputStore; // TS will elide 'unused' imports
import { setSource, source } from '../../../lib/model';
import SettingsPanel from './Settings/OCIRepository/Panel';
import Name from './Source/Name';
import Namespace from './Source/Namespace';


const setRefType = (val: string) => setSource('ociRefType', val);

function OCIRepository() {
	return (
		<div>
			<Name/>
			<Namespace/>
			<div>
				<label>Repository URL</label>
				<input use:bindInputStore={[source, setSource, 'ociUrl']} class="long"></input>
			</div>

			<div>
				<label>Reference</label>
				<div class="flex-row">
					<vscode-dropdown use:bindChangeValueFunc={setRefType}>
						<vscode-option>tag</vscode-option>
						<vscode-option>semver</vscode-option>
						<vscode-option>digest</vscode-option>
					</vscode-dropdown>
					<input use:bindInputStore={[source, setSource, 'ociRef']} style="margin-left: 4px; width: 23rem !important"></input>
				</div>
			</div>

			<SettingsPanel/>
		</div>
	);
}

export default OCIRepository;
