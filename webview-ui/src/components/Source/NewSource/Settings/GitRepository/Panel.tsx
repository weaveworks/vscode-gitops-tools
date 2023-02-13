import { createSignal, Show } from 'solid-js';
import { Collapse } from 'solid-collapse';

import Azure from '../Azure';
import { params } from 'lib/params';
import SettingsIntervals from '../Intervals';
import Checkbox from 'components/Common/Checkbox';

function Panel() {
	const [isOpen, setIsOpen] = createSignal(false);

	return (
		<div class="collapsable">
			<h3 classList={{'collapse-toggle': true, 'open': isOpen()}}
				onClick={() => setIsOpen(!isOpen())}><span class={`codicon ${isOpen() ? 'codicon-chevron-down' : 'codicon-chevron-right'}`}></span> Advanced Settings</h3>
			<Collapse value={isOpen()} class="collapse-transition">
				<div>
					<div style="margin-top: 1rem;"></div>

					<SettingsIntervals/>

					<div>
						<Checkbox store="gitRepository" field="recurseSubmodules">
										Recurse submodules
						</Checkbox>
						<div><i>When enabled, configures the GitRepository source to initialize and include Git submodules in the artifact it produces</i></div>
					</div>

					<Show when={params.clusterInfo?.isAzure}>
						<vscode-divider/>
						<Azure/>
					</Show>
				</div>
			</Collapse>
		</div>
	);
}

export default Panel;
