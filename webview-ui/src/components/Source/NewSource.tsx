import { Tabs } from '@microsoft/fast-foundation';
import { ToolkitHelpLink } from 'components/Common/HelpLink';
import { params } from 'lib/params';
import { onMount, Show } from 'solid-js';
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

				<vscode-panel-tab id="GitRepository-tab">
					GitRepository <ToolkitHelpLink href="source/gitrepositories/" />
				</vscode-panel-tab>

				<Show when={!params.clusterInfo?.isAzure}>
					<vscode-panel-tab id="HelmRepository-tab">
					HelmRepository <ToolkitHelpLink href="source/helmrepositories/"/>
					</vscode-panel-tab>

					<vscode-panel-tab id="OCIRepository-tab">
					OCIRepository <ToolkitHelpLink href="source/ocirepositories/"/>
					</vscode-panel-tab>
				</Show>
			 	<vscode-panel-tab id="Bucket-tab">
					Bucket <ToolkitHelpLink href="source/buckets/"/>
				</vscode-panel-tab>

				<vscode-panel-view>
					<GitRepository/>
				</vscode-panel-view>

				<Show when={!params.clusterInfo?.isAzure}>
					<vscode-panel-view>
						<HelmRepository/>
					</vscode-panel-view>

					<vscode-panel-view>
						<OCIRepository/>
					</vscode-panel-view>
				</Show>

				<vscode-panel-view>
					<Bucket/>
				</vscode-panel-view>
			</vscode-panels>
		</div>
	);
}

export default NewSource;
