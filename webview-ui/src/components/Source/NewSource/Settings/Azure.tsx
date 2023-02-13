import ListSelect from 'components/Common/ListSelect';
import Checkbox from 'components/Common/Checkbox';

function Azure() {
	return (
		<div style="margin-top: 1rem">
			<div>
				<Checkbox store="source" field="createFluxConfig">
					Create with FluxConfig
				</Checkbox>
				<div><i>A new Azure <code>FluxConfig</code> resource will be created to manage created resources</i></div>
			</div>
			<div style="margin-top: 1.5rem">
				<label>Azure Scope</label>
				<div>
					<ListSelect
						store="source" field="azureScope"
						items={() => ['cluster', 'namespace']}/>
				</div>
			</div>
		</div>
	);
}

export default Azure;
