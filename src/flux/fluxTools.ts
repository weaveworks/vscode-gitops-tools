import { window } from 'vscode';
import safesh from 'shell-escape-tag';
import { telemetry } from '../extension';
import { KubernetesObjectKinds, SourceObjectKinds } from '../kubernetes/types/kubernetesTypes';
import { shell } from '../shell';
import { TelemetryErrorEventNames } from '../telemetry';
import { parseJson } from '../utils/jsonUtils';
import { FluxSource, FluxTreeResources, FluxWorkload } from './fluxTypes';
import { Tracing } from 'trace_events';

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


export type CreateSourceGitGenericArgs = Parameters<typeof fluxTools['createSourceGit']>[0];
export type CreateSourceOCIGenericArgs = Parameters<typeof fluxTools['createSourceOCI']>[0];

class FluxTools {

	/**
	 * Transform string to an array.
	 */
	private splitLines(output: string) {
		return output.split('\n')
			.filter(str => str.length);
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


	createSourceGitCommand(args: CreateSourceGitGenericArgs) {
		const urlArg = ` --url "${args.url}"`;
		const namespaceArg = args.namespace ? ` --namespace "${args.namespace}"` : '';
		const branchArg = args.branch ? ` --branch "${args.branch}"` : '';
		const tagArg = args.tag ? ` --tag "${args.tag}"` : '';
		const semverArg = args.semver ? ` --tag-semver "${args.semver}"` : '';
		const intervalArg = args.interval ? ` --interval "${args.interval}"` : '';
		const timeoutArg = args.timeout ? ` --timeout "${args.timeout}"` : '';
		const caFileArg = args.caFile ? ` --ca-file "${args.caFile}"` : '';
		const privateKeyFileArg = args.privateKeyFile ? ` --private-key-file "${args.privateKeyFile}"` : '';
		const usernameArg = args.username ? ` --username "${args.username}"` : '';
		const passwordArg = args.password ? ` --password "${args.password}"` : '';
		const secretRefArg = args.secretRef ? ` --secret-ref "${args.secretRef}"` : '';
		const gitImplementation = args.gitImplementation ? ` --git-implementation "${args.gitImplementation}"` : '';
		const recurseSubmodules = args.recurseSubmodules ? ' --recurse-submodules' : '';
		const sshKeyAlgorithm = args.sshKeyAlgorithm ? ` --ssh-key-algorithm "${args.sshKeyAlgorithm}"` : '';
		const sshEcdsaCurve = args.sshEcdsaCurve ? ` --ssh-ecdsa-curve "${args.sshEcdsaCurve}"` : '';
		const sshRsaBits = args.sshRsaBits ? ` --ssh-rsa-bits "${args.sshRsaBits}"` : '';

		return `flux create source git ${args.sourceName}${urlArg}${branchArg}${namespaceArg}${tagArg}${semverArg}${intervalArg}${timeoutArg}${caFileArg}${privateKeyFileArg}${usernameArg}${passwordArg}${secretRefArg}${gitImplementation}${recurseSubmodules}${sshKeyAlgorithm}${sshEcdsaCurve}${sshRsaBits}`;
	}

	createSourceOCICommand(args: CreateSourceOCIGenericArgs) {
		const urlArg = ` --url "${args.url}"`;
		const namespaceArg = args.namespace ? ` --namespace "${args.namespace}"` : '';
		const digestArg = args.digest ? ` --digest "${args.digest}"` : '';
		const tagArg = args.tag ? ` --tag "${args.tag}"` : '';
		const semverArg = args.semver ? ` --tag-semver "${args.semver}"` : '';
		const intervalArg = args.interval ? ` --interval "${args.interval}"` : '';
		const timeoutArg = args.timeout ? ` --timeout "${args.timeout}"` : '';
		const certRefArg = args.certRef ? ` --cert-ref "${args.certRef}"` : '';
		const secretRefArg = args.secretRef ? ` --secret-ref "${args.secretRef}"` : '';
		const serviceAccountArg = args.serviceAccount ? ` --service-account "${args.serviceAccount}"` : '';
		const insecureArg = args.insecure ? ' --insecure' : '';
		const providerArg = args.ociProvider ? ` --provider ${args.ociProvider}` : ' --provider generic';

		return `flux create source oci ${args.sourceName}${urlArg}${digestArg}${namespaceArg}${tagArg}${semverArg}${intervalArg}${timeoutArg}${certRefArg}${secretRefArg}${serviceAccountArg}${insecureArg}${providerArg}`;
	}


	createKustomizationCommand(kustomizationName: string, sourceRef: string, kustomizationPath: string, namespace?: string, targetNamespace?: string, dependsOn?: string, prune?: boolean) {
		const namespaceArg = namespace ? ` --namespace "${namespace}"` : '';
		const targetNamespaceArg = targetNamespace ? ` --target-namespace "${targetNamespace}"` : '';
		const dependsOnArg = dependsOn ? ` --depends-on "${dependsOn}"` : '';
		const pruneArg = prune ? ' --prune=true' : ' --prune=false';

		return `flux create kustomization ${kustomizationName}${namespaceArg}${targetNamespaceArg}${dependsOnArg} --source=${sourceRef} --path="${kustomizationPath}"${pruneArg} --timeout=10s`;
	}



	/**
	 * Run `flux create source git`. If the protocol of the url is SSH -
	 * try to parse the deploy key from the flux output.
	 * @see https://fluxcd.io/docs/cmd/flux_create_source/
	 */
	async createSourceGit(args: {
		sourceName: string;
		url: string;
		namespace?: string;
		branch?: string;
		tag?: string;
		semver?: string;
		interval?: string;
		timeout?: string;
		caFile?: string;
		privateKeyFile?: string;
		username?: string;
		password?: string;
		secretRef?: string;
		gitImplementation?: string;
		recurseSubmodules?: boolean;
		sshKeyAlgorithm?: string;
		sshEcdsaCurve?: string;
		sshRsaBits?: string;
	}) {

		const command = this.createSourceGitCommand(args);
		const createSourceShellResult = await shell.execWithOutput(`${command} --silent`);

		if (createSourceShellResult.code !== 0) {
			// shell always fails in SSH case (without specifying any key) (as reconciliation error)
		}

		const output = createSourceShellResult.stdout || createSourceShellResult.stderr;

		// parse deploy key if the repository url is using SSH protocol
		let deployKey: string | undefined;
		const lines = this.splitLines(output);
		const deployKeyPrefix = `${FluxOutputSymbols.Plus} deploy key:`;
		for (const line of lines) {
			if (line.startsWith(deployKeyPrefix)) {
				deployKey = line.slice(deployKeyPrefix.length).trim();
			}
		}

		if (!deployKey) {
			return;
		}

		return {
			deployKey,
		};
	}

	async createSourceOCI(args: {
		sourceName: string;
		url: string;
		namespace?: string;
		tag?: string;
		semver?: string;
		digest?: string;
		interval?: string;
		timeout?: string;
		certRef?: string;
		insecure?: boolean;
		ociProvider?: 'generic' | 'aws' | 'azure' | 'gcp';
		secretRef?: string;
		serviceAccount?: string;
	}) {


		const command = this.createSourceOCICommand(args);
		const createSourceShellResult = await shell.execWithOutput(`${command}`);

		if (createSourceShellResult.code !== 0) {
			window.showErrorMessage(createSourceShellResult.stderr);
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_CREATE_SOURCE);
			return;
		}
	}

	async createKustomization(kustomizationName: string, sourceRef: string, kustomizationPath: string, namespace?: string, targetNamespace?: string, dependsOn?: string, prune?: boolean) {
		const command = this.createKustomizationCommand(kustomizationName, sourceRef, kustomizationPath, namespace, targetNamespace, dependsOn, prune);

		const createKustomizationShellResult = await shell.execWithOutput(command);

		if (createKustomizationShellResult.code !== 0) {
			window.showErrorMessage(createKustomizationShellResult.stderr);
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_CREATE_KUSTOMIZATION);
			return;
		}
	}

	async exportSourceGit(args: CreateSourceGitGenericArgs) {
		const command = this.createSourceGitCommand(args);
		const createSourceShellResult = await shell.execWithOutput(`${command} --export`);


		if (createSourceShellResult.code !== 0) {
			window.showErrorMessage(createSourceShellResult.stderr);
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_CREATE_SOURCE);

			return '---';
		}

		return createSourceShellResult.stdout;
	}


	async exportSourceOCI(args: CreateSourceOCIGenericArgs) {
		const command = this.createSourceOCICommand(args);
		const createSourceShellResult = await shell.execWithOutput(`${command} --export`);


		if (createSourceShellResult.code !== 0) {
			window.showErrorMessage(createSourceShellResult.stderr);
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_CREATE_SOURCE);

			return '---';
		}

		return createSourceShellResult.stdout;
	}


	async exportKustomization(kustomizationName: string, sourceRef: string, kustomizationPath: string, namespace?: string, targetNamespace?: string, dependsOn?: string, prune?: boolean) {
		const command = this.createKustomizationCommand(kustomizationName, sourceRef, kustomizationPath, namespace, targetNamespace, dependsOn, prune);

		const createKustomizationShellResult = await shell.execWithOutput(`${command} --export`);

		if (createKustomizationShellResult.code !== 0) {
			window.showErrorMessage(createKustomizationShellResult.stderr);
			telemetry.sendError(TelemetryErrorEventNames.FAILED_TO_RUN_FLUX_CREATE_KUSTOMIZATION);
			return '---';
		}

		return createKustomizationShellResult.stdout;
	}

}



/**
 * Helper methods for running and parsing flux commands.
 */
export const fluxTools = new FluxTools();
