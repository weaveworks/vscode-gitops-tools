import { window } from 'vscode';
import { shell } from '../shell';
import { FluxApplication, FluxSource } from './fluxTypes';

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
	 * @see https://github.com/fluxcd/flux2/blob/main/cmd/flux/check.go
	 */
	async check(): Promise<{ prerequisites: FluxPrerequisite[]; controllers: FluxController[]; } | undefined> {
		const result = await shell.execWithOutput('flux check', { revealOutputView: false });

		if (result?.code !== 0) {
			const stderr = result?.stderr;
			if (stderr) {
				window.showErrorMessage(String(result?.stderr || ''));
			}
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
				} else if (stage === 'controllers' && !line.startsWith(Symbols.ListItem)) {
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
		for (const controller of controllers) {
			let [name, status] = controller.split(':');
			name = name.slice(1).trim();
			status = status.split('deployment').pop() || '';

			parsedControllers.push({
				name,
				success: controller.startsWith(Symbols.Success),
				status,
			});
		}

		return {
			prerequisites: parsedPrerequises,
			controllers: parsedControllers,
		};
	}

	/**
	 * Run `flux install`
	 * @see https://fluxcd.io/docs/cmd/flux_install/
	 *
	 * @param context target kubernetes context
	 */
	async install(context: string) {
		let contextArg = '';
		if (context) {
			contextArg = `--context=${context}`;
		}
		await shell.execWithOutput(`flux install ${contextArg}`);
	}

	/**
	 * Run `flux uninstall`
	 * @see https://fluxcd.io/docs/cmd/flux_uninstall/
	 *
	 * @param context target kubernetes context
	 */
	async uninstall(context = '') {
		let contextArg = '';
		if (context) {
			contextArg = `--context=${context}`;
		}
		await shell.execWithOutput(`flux uninstall --silent ${contextArg}`);
	}

	/**
	 * Run `flux suspend`.
	 * @see https://fluxcd.io/docs/cmd/flux_suspend/
	 *
	 * @param type resource type
	 * @param name resource name
	 * @param namespace resource namespace
	 */
	async suspend(type: FluxSource | FluxApplication, name: string, namespace: string) {
		await shell.execWithOutput(`flux suspend ${type} ${name} -n ${namespace}`);
	}

	/**
	 * Run `flux resume`.
	 * @see https://fluxcd.io/docs/cmd/flux_resume/
	 *
	 * @param type resource type
	 * @param name resource name
	 * @param namespace resource namespace
	 */
	async resume(type: FluxSource | FluxApplication, name: string, namespace: string) {
		await shell.execWithOutput(`flux resume ${type} ${name} -n ${namespace}`);
	}

	/**
	 * Run `flux reconcile`
	 * @see https://fluxcd.io/docs/cmd/flux_reconcile
	 *
	 * @param type resource type
	 * @param name resource name
	 * @param namespace resource namespace
	 */
	async reconcile(type: FluxSource | FluxApplication, name: string, namespace: string) {
		await shell.execWithOutput(`flux reconcile ${type} ${name} -n ${namespace}`);
	}

	/**
	 * Run `flux delete`
	 * @see https://fluxcd.io/docs/cmd/flux_delete/
	 *
	 * @param type resource type
	 * @param name resource name
	 * @param namespace resource namespace
	 */
	async deleteSource(type: FluxSource, name: string, namespace: string) {
		await shell.execWithOutput(`flux delete ${type} ${name} -n ${namespace} --silent`);
	}

	/** Run `flux create source git`
	 * @see https://fluxcd.io/docs/cmd/flux_create_source_git/
	 *
	 * @param name resource name
	 * @param url git url
	 * @param branch git branch
	 */
	async createSourceGit(name: string, url: string, branch: string) {
		await shell.execWithOutput(`flux create source git ${name} --url ${url} --branch ${branch} --silent`);
	}
}

/**
 * Helper methods for running and parsing flux commands.
 */
export const fluxTools = new FluxTools();
