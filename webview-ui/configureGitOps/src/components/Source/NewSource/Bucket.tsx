import Name from './Common/Name';
import Namespace from './Common/Namespace';
import SettingsPanel from './Settings/Bucket/Panel';
import Connection from './Settings/Bucket/BucketConnection';


function Bucket() {
	return (
		<div>
			<Name/>
			<Namespace/>
			<Connection/>

			<SettingsPanel/>
		</div>
	);
}

export default Bucket;
