import { bindInputStore } from '../../../../lib/bindDirectives';
bindInputStore; // TS will elide 'unused' imports

import { setSource, source } from '../../../../lib/model';

function Name() {
	return (
		<div>
			<label><code>{source.kind}</code> Name</label>
			<input use:bindInputStore={[source, setSource, 'name']} class="medium"></input>
		</div>
	);
}

export default Name;
