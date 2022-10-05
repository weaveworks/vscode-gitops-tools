export function removeEmptyStrings(obj: { [x: string]: any; }) {
	for (const key in obj) {
		if(obj[key] === '') {
			obj[key] = undefined;
		}

		if(typeof obj[key] === 'object') {
			obj[key] = removeEmptyStrings(obj[key]);
		}
	}

	return obj;
}
