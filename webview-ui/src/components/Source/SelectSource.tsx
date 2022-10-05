import { params } from 'lib/params';
import ListSelect from 'components/Common/ListSelect';
import { namespacedSource } from 'lib/utils/helpers';


const namespacedSources = () => params.sources.map((s: any) => namespacedSource(s)).sort();

function SelectSource() {
	return (
		<div>
			<ListSelect
				items={namespacedSources}
				store="kustomization" field="source"/>
		</div>
	);
}

export default SelectSource;
