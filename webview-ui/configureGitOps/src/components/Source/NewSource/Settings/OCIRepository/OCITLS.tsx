import Checkbox from 'components/Common/Checkbox';
import { ToolkitHelpLink } from 'components/Common/HelpLink';
import TextInput from 'components/Common/TextInput';


function OCITLS() {
	return (
		<div>
			<div style="margin-top: 1rem">
				<label><code>Secret</code> with TLS certificate data<ToolkitHelpLink href="source/ocirepositories/#tls-certificates"/></label>
				<TextInput store="ociRepository" field="certRef" class="long"/>
			</div>
			<div style="margin-bottom: 1rem">
				<Checkbox store="ociRepository" field="insecure">
						Allow insecure (non-TLS) connection to the registry<ToolkitHelpLink href="source/ocirepositories/#insecure"/>
				</Checkbox>
			</div>
		</div>
	);
}

export default OCITLS;
