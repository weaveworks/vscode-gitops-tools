import { bindChangeValueFunc, bindInputStore } from '../../../lib/bindDirectives';
bindChangeValueFunc; bindInputStore; // TS will elide 'unused' imports

import { source, setSource } from '../../../lib/model';
import Name from './Source/Name';
import Namespace from './Source/Namespace';

import SettingsPanel from './Settings/HelmRepository/Panel';

export const isOCIHelm = () => source.helmUrl.indexOf('oci://') === 0;

function HelmRepository() {
	return (
		<div>
			<Name/>
			<Namespace/>
			<div>
				<label>Repository URL</label>
				<input use:bindInputStore={[source, setSource, 'helmUrl']} class="long"></input>
			</div>
			<SettingsPanel/>
		</div>
	);
}

export default HelmRepository;
