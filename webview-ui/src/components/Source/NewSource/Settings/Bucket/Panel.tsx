import Checkbox from 'components/Common/Checkbox';
import { params } from 'lib/params';
import { Collapse } from 'solid-collapse';
import { createSignal, Show } from 'solid-js';
import Azure from '../Azure';
import Intervals from '../Intervals';

function Panel() {
	const [isOpen, setIsOpen] = createSignal(false);

	return (
		<div class="collapsable">
			<h3 classList={{'collapse-toggle': true, 'open': isOpen()}}
				onClick={() => setIsOpen(!isOpen())}><span class={`codicon ${isOpen() ? 'codicon-chevron-down' : 'codicon-chevron-right'}`}></span> Advanced Settings</h3>
			<Collapse value={isOpen()} class="collapse-transition">
				<div>
					<div style="margin-bottom: 1rem"></div>

					<Show when={params.clusterInfo?.isAzure}>
						<Azure/>
					</Show>

					<Intervals/>
					<Checkbox store="bucket" field="insecure">
            Allow insecure (non-TLS) connection to the repository
					</Checkbox>

				</div>
			</Collapse>
		</div>
	);
}

export default Panel;
