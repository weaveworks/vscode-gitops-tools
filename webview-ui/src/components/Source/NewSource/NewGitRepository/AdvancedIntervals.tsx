import { bindInputStore } from '../../../../lib/bindDirectives';  bindInputStore; // TS will elide 'unused' imports
import { source, setSource } from '../../../../lib/model';

function AdvancedIntervals() {
	return (
		<div>
			<div>
				<label>Repository sync interval</label>
				<div class="flex-row">
					<input use:bindInputStore={[source, setSource, 'interval']} class="short-number"></input>
				</div>
			</div>
			<div>
				<label>Repository sync timeout</label>
				<div class="flex-row">
					<input use:bindInputStore={[source, setSource, 'timeout']} class="short-number"></input>
				</div>
			</div>
		</div>
	);
}

export default AdvancedIntervals;
