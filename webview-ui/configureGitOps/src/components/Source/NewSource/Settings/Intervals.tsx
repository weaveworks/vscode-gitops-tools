import TextInput from 'components/Common/TextInput';
import { source, setSource } from 'lib/model';

function SettingsIntervals() {
	return (
		<div>
			<div>
				<label>Repository sync interval</label>
				<div class="flex-row">
					<TextInput store="source" field="interval" class="short-number"/>
				</div>
			</div>
		</div>
	);
}

export default SettingsIntervals;
