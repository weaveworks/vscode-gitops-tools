import { Tabs } from '@microsoft/fast-foundation';
import { onMount } from 'solid-js';
import { setSource, source } from '../../lib/model';

import Bucket from './NewSource/Bucket';
import GitRepository from './NewSource/GitRepository';
import HelmRepository from './NewSource/HelmRepository';
import OCIRepository from './NewSource/OCIRepository';

let tabs: Tabs;


function NewSource() {
	onMount(() => {
		tabs.addEventListener('change', (e: Event) => {
			const kind = tabs.activeid.slice(0, -4);
			setSource('kind', kind);
		});
	});


	return (
		<div>
			<vscode-panels ref={tabs} activeid={`${source.kind}-tab`} aria-label="Type of source">
				<vscode-panel-tab id="GitRepository-tab">GitRepository&nbsp;<a href="https://fluxcd.io/flux/components/source/gitrepositories/"><span class="codicon codicon-question"></span></a></vscode-panel-tab>
				{/* <vscode-panel-tab id="HelmRepository-tab">HelmRepository</vscode-panel-tab> */}
				<vscode-panel-tab id="OCIRepository-tab">OCIRepository&nbsp;<a href="https://fluxcd.io/flux/components/source/ocirepositories/"><span class="codicon codicon-question"></span></a></vscode-panel-tab>
				{/* <vscode-panel-tab id="Bucket-tab">Bucket</vscode-panel-tab> */}
				<vscode-panel-view>
					<GitRepository/>
				</vscode-panel-view>
				{/* <vscode-panel-view>
					<HelmRepository/>
				</vscode-panel-view> */}
				<vscode-panel-view>
					<OCIRepository/>
				</vscode-panel-view>
				{/* <vscode-panel-view>
					<Bucket/>
				</vscode-panel-view> */}
			</vscode-panels>
		</div>
	);
}

export default NewSource;
