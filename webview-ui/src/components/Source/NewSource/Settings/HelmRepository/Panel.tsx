import { Collapse } from 'solid-collapse';
import { createSignal } from 'solid-js';
import Intervals from '../Intervals';
import Connection from './HelmConnection';

function Panel() {
	const [isOpen, setIsOpen] = createSignal(true);

	return (
		<div class="collapsable">
			<h3 classList={{'collapse-toggle': true, 'open': isOpen()}}
				onClick={() => setIsOpen(!isOpen())}><span class={`codicon ${isOpen() ? 'codicon-chevron-down' : 'codicon-chevron-right'}`}></span> Advanced Settings</h3>
			<Collapse value={isOpen()} class="collapse-transition">
				<div>
					<vscode-panels activeId="helm-connection-tab" aria-label="Advanced HelmRepository source settings">
						<vscode-panel-tab id="helm-intervals-tab">Intervals</vscode-panel-tab>
						<vscode-panel-tab id="helm-connection-tab">Connection</vscode-panel-tab>

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
