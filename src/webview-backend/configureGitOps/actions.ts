import { ParamsDictionary } from '../../utils/typeUtils';
import { createConfigurationAzure } from './lib/createAzure';
import { createConfigurationGeneric } from './lib/createGeneric';
import { exportConfigurationGeneric } from './lib/exportGeneric';


const isAzure = (data: ParamsDictionary) => data.clusterInfo.isAzure && (data.source?.createFluxConfig || data.selectedSource);

export async function actionCreate(data: ParamsDictionary) {
	if(isAzure(data)) {
		createConfigurationAzure(data);
	} else {
		createConfigurationGeneric(data);
	}
}


export async function actionYAML(data: ParamsDictionary) {
	if(!isAzure(data)) {
		exportConfigurationGeneric(data);
	}
}
