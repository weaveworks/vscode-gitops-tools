import { Collapse } from 'solid-collapse';
import { createSignal } from 'solid-js';
import Intervals from '../Intervals';
import Connection from './BucketConnection';

function Panel() {
	const [isOpen, setIsOpen] = createSignal(true);

	return (
		<div class="collapsable">
			<h3 classList={{'collapse-toggle': true, 'open': isOpen()}}
				onClick={() => setIsOpen(!isOpen())}><span class={`codicon ${isOpen() ? 'codicon-chevron-down' : 'codicon-chevron-right'}`}></span> Advanced Settings</h3>
			<Collapse value={isOpen()} class="collapse-transition">
				<div>
					<vscode-panels activeId="Bucket-connection-tab" aria-label="Advanced Bucket source settings">
						<vscode-panel-tab id="Bucket-intervals-tab">Intervals</vscode-panel-tab>
						<vscode-panel-tab id="Bucket-connection-tab">Connection</vscode-panel-tab>

						<vscode-panel-view>
							<Intervals/>
						</vscode-panel-view>
						<vscode-panel-view >
							<Connection/>
						</vscode-panel-view>

					</vscode-panels>
				</div>
			</Collapse>
		</div>
	);
}

export default Panel;
