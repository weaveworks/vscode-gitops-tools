import { shell } from '../shell';

/**
 * Special symbols used in flux output.
 */
const enum Symbols {
	ListItem = '►',
	Success = '✔',
	Failure = '✗',
}

/**
 * Parsed flux controller.
 */
export interface FluxController {
	name: string;
	image: string;
	success: boolean;
	status: string;
}

/**
 * Flux prerequisite.
 */
export interface FluxPrerequisite {
	name: string;
	success: boolean;
}

class FluxTools {

	/**
	 * Transform string to an array.
	 */
	private splitLines(str: string) {
		return str.split('\n');
	}

	/**
	 * Parse prerequisites and controllers from `flux check` CLI command.
	 *
	 * https://github.com/fluxcd/flux2/blob/main/cmd/flux/check.go
	 */
	async check(): Promise<{ prerequisites: FluxPrerequisite[]; controllers: FluxController[] } | undefined> {
		const result = await shell.exec('flux check');
		if (result?.code !== 0) {
			return undefined;
		}
		const prerequisites: string[] = [];
		const controllers: string[] = [];
		let stage: 'prerequisites' | 'controllers' | '' = '';

		// Split output into sections
		for (const line of this.splitLines(result.stderr)) {
			if (line === '► checking prerequisites') {
				stage = 'prerequisites';
			} else if (line === '► checking controllers') {
				stage = 'controllers';
			} else if (line === '✔ all checks passed') {
				stage = '';
			} else {
				if (stage === 'prerequisites') {
					prerequisites.push(line);
				} else if (stage === 'controllers') {
					controllers.push(line);
				}
			}
		}

		// Parse prerequisites
		const parsedPrerequises: FluxPrerequisite[] = [];
		for (const prerequisite of prerequisites) {
			parsedPrerequises.push({
				name: prerequisite.slice(1).trim(),
				success: prerequisite.startsWith(Symbols.Success),
			});
		}

		// Parse controllers
		const parsedControllers: FluxController[] = [];
		for (let i = 0; i < controllers.length; i+= 2) {
			const controllerStatus = controllers[i];
			const controllerImageName = controllers[i + 1];

			let [name, status] = controllerStatus.split(':');
			name = name.slice(1).trim();
			status = status.split('deployment').pop() || '';

			parsedControllers.push({
				name,
				image: controllerImageName.slice(1).trim(),
				success: controllerStatus.startsWith(Symbols.Success),
				status,
			});
		}

		return {
			prerequisites: parsedPrerequises,
			controllers: parsedControllers,
		};
	}
}

/**
 * Helper methods for running and parsing flux commands.
 */
export const fluxTools = new FluxTools();
