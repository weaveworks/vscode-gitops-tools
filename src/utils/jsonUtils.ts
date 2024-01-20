import { window } from 'vscode';

import { telemetry } from 'extension';
import { TelemetryError } from 'types/telemetryEventNames';

export function parseJson(jsonString: string): any {
	let jsonData: any;

	try {
		jsonData = JSON.parse(jsonString.trim());
	} catch(e: unknown) {
		window.showErrorMessage(`JSON.parse() failed ${e}`);
		telemetry.sendError(TelemetryError.UNCAUGHT_EXCEPTION, new Error('parseJson() failed'));
		return;
	}

	return jsonData;
}


export function parseJsonItems<T>(jsonString: string): T[] {
	const result = parseJson(jsonString);
	return result?.items || [];
}
