import { createSignal, Show } from 'solid-js';
import { Collapse } from 'solid-collapse';
import AdvancedIntervals from './AdvancedIntervals';
import AdvancedConnection from './AdvancedConnection';
import AdvancedAzure from './AdvancedAzure';
import { params } from '../../../../lib/params';

function NewGitAdvanced() {
	const [isOpen, setIsOpen] = createSignal(false);

	return (
		<div class="collapsable">
			<h3 classList={{'collapse-toggle': true, 'open': isOpen()}}
				onClick={() => setIsOpen(!isOpen())}><span class={`codicon ${isOpen() ? 'codicon-chevron-down' : 'codicon-chevron-right'}`}></span> Advanced Settings</h3>
			<Collapse value={isOpen()} class="collapse-transition">
				<div>
					<vscode-panels activeId="git-intervals-tab" aria-label="Advanced GitRepository source settings">
						<vscode-panel-tab id="git-intervals-tab">Sync Intervals</vscode-panel-tab>
						<vscode-panel-tab id="git-connection-tab">Git Connection</vscode-panel-tab>
						<Show when={params.clusterInfo?.isAzure}>
							<vscode-panel-tab id="git-azure-tab">Azure</vscode-panel-tab>
						</Show>

						<vscode-panel-view>
							<AdvancedIntervals/>
						</vscode-panel-view>
						<vscode-panel-view >
							<AdvancedConnection/>
						</vscode-panel-view>
						<Show when={params.clusterInfo?.isAzure}>
							<vscode-panel-view >
								<AdvancedAzure/>
							</vscode-panel-view>
						</Show>
					</vscode-panels>
				</div>
			</Collapse>
		</div>
	);
}

export default NewGitAdvanced;
