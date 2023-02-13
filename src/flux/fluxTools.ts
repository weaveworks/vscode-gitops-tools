import { window } from 'vscode';
import safesh from 'shell-escape-tag';
import { telemetry } from '../extension';
import { KubernetesObjectKinds, SourceObjectKinds } from '../kubernetes/types/kubernetesTypes';
import { shell } from '../shell';
import { TelemetryErrorEventNames } from '../telemetry';
import { parseJson } from '../utils/jsonUtils';
import { FluxSource, FluxTreeResources, FluxWorkload } from './fluxTypes';
import { buildCLIArgs, cliKind } from './cliArgs';

/**
 * Special symbols used in flux output.
 */
const enum FluxOutputSymbols {
	ListItem = '►',
	Plus = '✚',
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
	private splitLines(output: string) {
		return output.split('\n')
			.filter(str => str.length);
	}

	private parseDeployKey(output: string): string | undefined {
		// parse deploy key if the repository url is using SSH protocol
		const lines = this.splitLines(output);
		const deployKeyPrefix = `${FluxOutputSymbols.Plus} deploy key:`;
		for (const line of lines) {
			if (line.startsWith(deployKeyPrefix)) {
				return line.slice(deployKeyPrefix.length).trim();
			}
		}
	}

	/**
	 * Parse prerequisites and controllers from `flux check` CLI command.
	 *
	 * @see https://fluxcd.io/docs/cmd/flux_check/
	 *
	 * https://github.com/fluxcd/flux2/blob/main/cmd/flux/check.go
	 */
	async check(context: string): Promise<{ prerequisites: FluxPrerequisite[]; controllers: FluxController[]; } | undefined> {
		const result = await shell.execWithOutput(safesh`flux check --context ${context}`, { revealOutputView: false });

		if (result.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_CHECK);
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
			} else if (line === '✔ all checks passed' || line === '► checking crds') {
				stage = '';
			} else {
				if (stage === 'prerequisites') {
					prerequisites.push(line);
				} else if (stage === 'controllers' && !line.startsWith(FluxOutputSymbols.ListItem)) {
					controllers.push(line);
				}
			}
		}

		// Parse prerequisites
		const parsedPrerequises: FluxPrerequisite[] = [];
		for (const prerequisite of prerequisites) {
			parsedPrerequises.push({
				name: prerequisite.slice(1).trim(),
				success: prerequisite.startsWith(FluxOutputSymbols.Success),
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
				success: controller.startsWith(FluxOutputSymbols.Success),
				status,
			});
		}

		return {
			prerequisites: parsedPrerequises,
			controllers: parsedControllers,
		};
	}

	/**
	 * @see https://fluxcd.io/docs/cmd/flux_tree_kustomization/
	 */
	async tree(name: string, namespace: string): Promise<undefined | FluxTreeResources> {

		const treeShellResult = await shell.exec(`flux tree kustomization ${name} -n ${namespace} -o json`);

		if (treeShellResult.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_TREE);
			window.showErrorMessage(`Failed to get resources created by the workload ${name}. ERROR: ${treeShellResult?.stderr}`);
			return;
		}

		return parseJson(treeShellResult.stdout);
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
			contextArg = safesh`--context=${context}`;
		}
		const installShellResult = await shell.execWithOutput(`flux install ${contextArg}`);
		if (installShellResult.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_INSTALL);
		}
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
			contextArg = safesh`--context=${context}`;
		}
		const uninstallShellResult = await shell.execWithOutput(`flux uninstall --silent ${contextArg}`);
		if (uninstallShellResult.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_UNINSTALL);
		}
	}

	/**
	 * Run `flux suspend`.
	 * @see https://fluxcd.io/docs/cmd/flux_suspend/
	 *
	 * @param type resource type
	 * @param name resource name
	 * @param namespace resource namespace
	 */
	async suspend(type: FluxSource | FluxWorkload, name: string, namespace: string) {
		const suspendShellResult = await shell.execWithOutput(`flux suspend ${type} ${name} -n ${namespace}`);
		if (suspendShellResult.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_SUSPEND);
		}
	}

	/**
	 * Run `flux resume`.
	 * @see https://fluxcd.io/docs/cmd/flux_resume/
	 *
	 * @param type resource type
	 * @param name resource name
	 * @param namespace resource namespace
	 */
	async resume(type: FluxSource | FluxWorkload, name: string, namespace: string) {
		const resumeShellResult = await shell.execWithOutput(`flux resume ${type} ${name} -n ${namespace}`);
		if (resumeShellResult.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_RESUME);
		}
	}

	/**
	 * Run `flux reconcile`
	 * @see https://fluxcd.io/docs/cmd/flux_reconcile
	 *
	 * @param type resource type
	 * @param name resource name
	 * @param namespace resource namespace
	 */
	async reconcile(type: FluxSource | FluxWorkload, name: string, namespace: string) {
		const reconcileShellResult = await shell.execWithOutput(`flux reconcile ${type} ${name} -n ${namespace}`);
		if (reconcileShellResult.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_RECONCILE);
		}
	}

	/**
	 * @see https://fluxcd.io/docs/cmd/flux_trace/
	 */
	async trace(name: string, kind: string, apiVersion: string, namespace: string) {
		const traceShellResult = await shell.execWithOutput(`flux trace ${name} --kind=${kind} --api-version=${apiVersion} --namespace=${namespace}`);
		if (traceShellResult.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_TRACE);
		}
	}

	/**
	 * Run `flux delete`
	 * @see https://fluxcd.io/docs/cmd/flux_delete/
	 *
	 * @param type resource type
	 * @param name resource name
	 * @param namespace resource namespace
	 */
	async delete(type: FluxSource | FluxWorkload, name: string, namespace: string) {
		const deleteSourceShellResult = await shell.execWithOutput(`flux delete ${type} ${name} -n ${namespace} --silent`);
		if (deleteSourceShellResult.code !== 0) {
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_DELETE_SOURCE);
		}
	}


	createSourceCommand(source: any): string {
		const commandKind = cliKind(source.kind);
		const name = source.name;

		delete source.kind;
		delete source.name;

		const args = buildCLIArgs(source);

		return `flux create source ${commandKind} ${name} ${args}`;
	}


	createKustomizationCommand(kustomization: any): string {
		const name = kustomization.name;
		delete kustomization.name;

		const args = buildCLIArgs(kustomization);

		return `flux create kustomization ${name} ${args}`;
	}

	async createSource(source: any) {
		const command = this.createSourceCommand(source);
		const shellResult = await shell.execWithOutput(command);

		if (shellResult.code !== 0) {
			window.showErrorMessage(shellResult.stderr);
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_CREATE_SOURCE);
		}

		const output = shellResult.stdout || shellResult.stderr;

		return(this.parseDeployKey(output));
	}

	async exportSource(source: any) {
		const command = `${this.createSourceCommand(source)} --export`;

		const shellResult = await shell.execWithOutput(command);

		if(shellResult.code !== 0) {
			window.showErrorMessage(shellResult.stderr);
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_CREATE_SOURCE);

			return '---';
		}

		return shellResult.stdout;
	}

	async createKustomization(kustomization: any) {
		const command = this.createKustomizationCommand(kustomization);
		const shellResult = await shell.execWithOutput(command);

		if (shellResult.code !== 0) {
			window.showErrorMessage(shellResult.stderr);
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_CREATE_KUSTOMIZATION);
		}
	}

	async exportKustomization(kustomization: any) {
		const command = `${this.createKustomizationCommand(kustomization)} --export`;
		const shellResult = await shell.execWithOutput(command);

		if(shellResult.code !== 0) {
			window.showErrorMessage(shellResult.stderr);
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_CREATE_KUSTOMIZATION);

			return '---';
		}

		return shellResult.stdout;
	}

}



/**
 * Helper methods for running and parsing flux commands.
 */
export const fluxTools = new FluxTools();
