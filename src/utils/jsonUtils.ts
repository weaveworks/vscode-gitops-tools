export function parseJson(jsonString: string): any {
	let jsonData: any;
	try {
		jsonData = JSON.parse(jsonString.trim());
	}
	catch(e) {
		// TODO: add and user proper logging for JSON parse errors
		console.warn(`JSON.parse() failed ${e}`);
		return;
	}
  return jsonData;
}
