import Checkbox from 'components/Common/Checkbox';
import { ToolkitHelpLink } from 'components/Common/HelpLink';
import { Collapse } from 'solid-collapse';
import { createSignal } from 'solid-js';
import Intervals from '../Intervals';
import Connection from './HelmConnection';

function Panel() {
	const [isOpen, setIsOpen] = createSignal(false);

	return (
		<div class="collapsable">
			<h3 classList={{'collapse-toggle': true, 'open': isOpen()}}
				onClick={() => setIsOpen(!isOpen())}><span class={`codicon ${isOpen() ? 'codicon-chevron-down' : 'codicon-chevron-right'}`}></span> Advanced Settings</h3>
			<Collapse value={isOpen()} class="collapse-transition">
				<div style="margin-bottom: 1rem">
					<Checkbox store="helmRepository" field="passCredentials">
							Pass credentials to all domains (HTTP/S repositories only)
					</Checkbox>
					<ToolkitHelpLink href="source/helmrepositories/#pass-credentials"/>

				</div>
				<Intervals/>
			</Collapse>
		</div>
	);
}

export default Panel;
