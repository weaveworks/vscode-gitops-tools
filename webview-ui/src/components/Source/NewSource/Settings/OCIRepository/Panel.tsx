import { Collapse } from 'solid-collapse';
import { createSignal } from 'solid-js';
import SettingsIntervals from '../Intervals';
import SettingsConnection from './OCIConnection';
import SettingsTLS from './OCITLS';

function Panel() {
	const [isOpen, setIsOpen] = createSignal(false);

	return (
		<div class="collapsable">
			<h3 classList={{'collapse-toggle': true, 'open': isOpen()}}
				onClick={() => setIsOpen(!isOpen())}><span class={`codicon ${isOpen() ? 'codicon-chevron-down' : 'codicon-chevron-right'}`}></span> Advanced Settings</h3>
			<Collapse value={isOpen()} class="collapse-transition">
				<div>
					<vscode-panels activeid="oci-intervals-tab" aria-label="Advanced OCIRepository source settings">
						<vscode-panel-tab id="oci-intervals-tab">Intervals</vscode-panel-tab>
						<vscode-panel-tab id="oci-connection-tab">Connection</vscode-panel-tab>
						<vscode-panel-tab id="oci-tls-tab">TLS</vscode-panel-tab>

						<vscode-panel-view>
							<SettingsIntervals/>
						</vscode-panel-view>
						<vscode-panel-view >
							<SettingsConnection/>
						</vscode-panel-view>
						<vscode-panel-view >
							<SettingsTLS/>
						</vscode-panel-view>

					</vscode-panels>
				</div>
			</Collapse>
		</div>
	);
}

export default Panel;
