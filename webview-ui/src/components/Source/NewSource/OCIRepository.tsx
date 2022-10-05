import ListSelect from 'components/Common/ListSelect';
import SettingsPanel from './Settings/OCIRepository/Panel';
import Name from './Common/Name';
import Namespace from './Common/Namespace';
import TextInput from 'components/Common/TextInput';
import { ToolkitHelpLink } from 'components/Common/HelpLink';


function OCIRepository() {
	return (
		<div>
			<Name/>
			<Namespace/>
			<div>
				<label>Repository URL</label>
				<TextInput store="ociRepository" field="url" class="long"/>
			</div>

			<div>
				<label>Reference</label>
				<div class="flex-row">
					<ListSelect
						store="ociRepository" field="refType"
						items={() => ['tag', 'tagSemver', 'digest']}/>
					<TextInput store="ociRepository" field="ref" style="margin-left: 4px; width: 24.8rem !important"/>
				</div>
			</div>

			<vscode-divider/>
			<div style="margin-bottom: 1rem"><i>Authentication settings for private repositories</i></div>
			<div>
				<label>OCI Provider</label>
				<div class="flex-row">
					<ListSelect
						store="ociRepository" field="provider"
						items={() => ['generic', 'aws', 'azure', 'gcp']}/>
				</div>
			</div>

			<div>
				<label><code>Secret</code> with authentication credentials for the provider <ToolkitHelpLink href="source/helmrepositories/#secret-reference"/></label>
				<TextInput store="source" field="secretRef" class="long"/>
			</div>

			<div>
				<label><code>ServiceAccount</code> with image pull secrets for authentication<ToolkitHelpLink href="source/ocirepositories/#service-account-reference"/></label>
				<TextInput store="ociRepository" field="serviceAccount" class="long"/>
			</div>


			<SettingsPanel/>
		</div>
	);
}

export default OCIRepository;
