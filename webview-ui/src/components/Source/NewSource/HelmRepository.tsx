
import TextInput from 'components/Common/TextInput';
import { helmRepository, source } from '../../../lib/model';
import Name from './Common/Name';
import Namespace from './Common/Namespace';

import SettingsPanel from './Settings/HelmRepository/Panel';
import HelmConnection from './Settings/HelmRepository/HelmConnection';


export const isOCIHelm = () => helmRepository.url.indexOf('oci://') === 0;

function HelmRepository() {
	return (
		<div>
			<Name/>
			<Namespace/>
			<div>
				<label>Repository URL</label>
				<TextInput store="helmRepository" field="url" class="long"/>
			</div>
			<HelmConnection/>
			<SettingsPanel/>
		</div>
	);
}

export default HelmRepository;
