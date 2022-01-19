import { window } from 'vscode';
import { telemetry } from '../extension';
import { SpecificErrorEvent } from '../telemetry';

export function parseJson(jsonString: string): any {
	let jsonData: any;

	try {
		jsonData = JSON.parse(jsonString.trim());
	} catch(e: unknown) {
		window.showErrorMessage(`JSON.parse() failed ${e}`);
		telemetry.sendError(SpecificErrorEvent.UNCAUGHT_EXCEPTION, new Error('parseJson() failed'));
		return;
	}

	return jsonData;
}
