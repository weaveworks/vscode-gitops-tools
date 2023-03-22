import TextInput from 'components/Common/TextInput';
import { source } from 'lib/model';

function Name() {
	return (
		<div>
			<label><code>{source.kind}</code> Name</label>
			<TextInput store="source" field="name" class="medium"/>
		</div>
	);
}

export default Name;
