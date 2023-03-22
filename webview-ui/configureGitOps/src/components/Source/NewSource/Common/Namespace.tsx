import  ListSelect from 'components/Common/ListSelect';
import { params } from 'lib/params';

function Namespace() {
	return (
		<div>
			<label>Namespace</label>
			<div>
				<ListSelect
					store="source" field="namespace"
					items={() => params.namespaces}
					class="medium"/>
			</div>
		</div>
	);
}

export default Namespace;
