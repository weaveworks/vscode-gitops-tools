import { Tabs } from '@microsoft/fast-foundation';
import { createEffect, onMount, Show } from 'solid-js';
import { setCreateSource } from '../lib/model';
import { params } from '../lib/params';
import { bindChangeTabsFunc } from '../lib/bindDirectives'; bindChangeTabsFunc; // TS will elide 'unused' imports
import NewSource from './Source/NewSource';
import SelectSource from './Source/SelectSource';

let tabs: Tabs;

function Source() {
	const selectSourceEnabled = () => (params.sources?.length > 0);

	onMount(() => {
		tabs.addEventListener('change', (e: Event) => setCreateSource(tabs.activeid === 'new-source-tab'));
	});

	createEffect(() => {
		const activeid = (params.selectSourceTab && params.sources?.length > 0) ? 'select-source-tab' : 'new-source-tab';
		tabs.activeid = activeid;
		setCreateSource(tabs.activeid === 'new-source-tab');
	});


	return(
		<div>
			<h2 style="margin-bottom: 0.5rem !important">Source Repository</h2>
			{/* <vscode-panels use:bindChangeTabsFunc={newSourceTabSelected} id="source-panel" aria-label="New or select source?" activeid={activeid()}> */}
			<vscode-panels ref={tabs} id="source-panel" aria-label="New or select source?" activeid="new-source-tab">
				<vscode-panel-tab id="new-source-tab">New Source...</vscode-panel-tab>

				<Show when={selectSourceEnabled()}>
					<vscode-panel-tab id="select-source-tab">Select Source</vscode-panel-tab>
				</Show>


				<vscode-panel-view>
					<NewSource/>
				</vscode-panel-view>
				<Show when={selectSourceEnabled()}>
					<vscode-panel-view>
						<SelectSource/>
					</vscode-panel-view>
				</Show>
			</vscode-panels>
		</div>
	);
}

export default  Source;
