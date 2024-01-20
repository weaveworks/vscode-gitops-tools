import { KubernetesObject } from './types/kubernetesTypes';

export function sortByMetadataName<Type extends KubernetesObject>(items: Type[]): Type[] {
	return items.sort((i1: any, i2: any) => {
		if (i1.metadata.name && i2.metadata.name) {
			if (i1.metadata.name > i2.metadata.name) {
				return 1;
			}
			if (i1.metadata.name < i2.metadata.name) {
				return -1;
			}
		}
		return 0;
	});
}
