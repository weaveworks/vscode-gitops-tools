import TelemetryReporter from '@vscode/extension-telemetry';
import { env, ExtensionContext, ExtensionMode } from 'vscode';


export const enum TelemetryErrorEventNames {
	/**
	 * Uncaught exception. Doesn't tell much. Need to see stack trace attached.
	 */
	UNCAUGHT_EXCEPTION = 'UNCAUGHT_EXCEPTION',
	/**
	 * There is no check at the startup for whether or not
	 * the `git` is installed.
	 * User tried to execute one of the commands that required git cli,
	 * bit it's not found on the machine.
	 */
	// install
	GIT_NOT_INSTALLED = 'GIT_NOT_INSTALLED',
	// kubectl
	KUBERNETES_TOOLS_API_UNAVAILABLE = 'KUBERNETES_TOOLS_API_UNAVAILABLE',
	FAILED_TO_GET_KUBECTL_CONFIG = 'FAILED_TO_GET_KUBECTL_CONFIG',
	FAILED_TO_GET_CURRENT_KUBERNETES_CONTEXT = 'FAILED_TO_GET_CURRENT_KUBERNETES_CONTEXT',
	FAILED_TO_SET_CURRENT_KUBERNETES_CONTEXT = 'FAILED_TO_SET_CURRENT_KUBERNETES_CONTEXT',
	FAILED_TO_GET_CHILDREN_OF_A_WORKLOAD = 'FAILED_TO_GET_CHILDREN_OF_A_WORKLOAD',
	FAILED_TO_GET_NODES_TO_DETECT_AKS_CLUSTER = 'FAILED_TO_GET_NODES_TO_DETECT_AKS_CLUSTER',
	FAILED_TO_GET_CONFIGMAPS_TO_DETECT_ARC_CLUSTER = 'FAILED_TO_GET_CONFIGMAPS_TO_DETECT_ARC_CLUSTER',
	FAILED_TO_GET_PODS_OF_A_DEPLOYMENT = 'FAILED_TO_GET_PODS_OF_A_DEPLOYMENT',
	FAILED_TO_GET_KUSTOMIZATIONS = 'FAILED_TO_GET_KUSTOMIZATIONS',
	FAILED_TO_GET_HELM_RELEASES = 'FAILED_TO_GET_HELM_RELEASES',
	FAILED_TO_GET_GIT_REPOSITORIES = 'FAILED_TO_GET_GIT_REPOSITORIES',
	FAILED_TO_GET_OCI_REPOSITORIES = 'FAILED_TO_GET_OCI_REPOSITORIES',
	FAILED_TO_GET_HELM_REPOSITORIES = 'FAILED_TO_GET_HELM_REPOSITORIES',
	FAILED_TO_GET_BUCKETS = 'FAILED_TO_GET_BUCKETS',
	FAILED_TO_GET_NAMESPACES = 'FAILED_TO_GET_NAMESPACES',
	FAILED_TO_GET_RESOURCE = 'FAILED_TO_GET_RESOURCE',
	FAILED_TO_GET_FLUX_CONTROLLERS = 'FAILED_TO_GET_FLUX_CONTROLLERS',
	FAILED_TO_GET_AVAILABLE_RESOURCE_KINDS = 'FAILED_TO_GET_AVAILABLE_RESOURCE_KINDS',
	// VSCode
	FAILED_TO_OPEN_RESOURCE = 'FAILED_TO_OPEN_RESOURCE',
	// Flux
	FAILED_TO_RUN_FLUX_CREATE_SOURCE = 'FAILED_TO_RUN_FLUX_CREATE_SOURCE',
	FAILED_TO_RUN_FLUX_CREATE_KUSTOMIZATION = 'FAILED_TO_RUN_FLUX_CREATE_KUSTOMIZATION',
	FAILED_TO_RUN_FLUX_DELETE_SOURCE = 'FAILED_TO_RUN_FLUX_DELETE_SOURCE',
	FAILED_TO_RUN_FLUX_CHECK = 'FAILED_TO_RUN_FLUX_CHECK',
	FAILED_TO_RUN_FLUX_TREE = 'FAILED_TO_RUN_FLUX_TREE',
	FAILED_TO_RUN_FLUX_INSTALL = 'FAILED_TO_RUN_FLUX_INSTALL',
	FAILED_TO_RUN_FLUX_UNINSTALL = 'FAILED_TO_RUN_FLUX_UNINSTALL',
	FAILED_TO_RUN_FLUX_SUSPEND = 'FAILED_TO_RUN_FLUX_SUSPEND',
	FAILED_TO_RUN_FLUX_RESUME = 'FAILED_TO_RUN_FLUX_RESUME',
	FAILED_TO_RUN_FLUX_RECONCILE = 'FAILED_TO_RUN_FLUX_RECONCILE',
	FAILED_TO_RUN_FLUX_TRACE = 'FAILED_TO_RUN_FLUX_TRACE',
	// Azure CLI
	FAILED_TO_RUN_AZ_RESUME_SOURCE = 'FAILED_TO_RUN_AZ_RESUME_SOURCE',
	FAILED_TO_RUN_AZ_SUSPEND_SOURCE = 'FAILED_TO_RUN_AZ_SUSPEND_SOURCE',
	FAILED_TO_RUN_AZ_DELETE_SOURCE = 'FAILED_TO_RUN_AZ_DELETE_SOURCE',
	FAILED_TO_RUN_AZ_CREATE_SOURCE = 'FAILED_TO_RUN_AZ_CREATE_SOURCE',
	FAILED_TO_RUN_AZ_CREATE_WORKLOAD = 'FAILED_TO_RUN_AZ_CREATE_WORKLOAD',
	FAILED_TO_RUN_AZ_DELETE_WORKLOAD = 'FAILED_TO_RUN_AZ_DELETE_WORKLOAD',
	FAILED_TO_RUN_AZ_ENABLE_GITOPS = 'FAILED_TO_RUN_AZ_ENABLE_GITOPS',
	FAILED_TO_RUN_AZ_DISABLE_GITOPS = 'FAILED_TO_RUN_AZ_DISABLE_GITOPS',
	FAILED_TO_RUN_AZ_LIST_FLUX_CONFIGURATIONS = 'FAILED_TO_RUN_AZ_LIST_FLUX_CONFIGURATIONS',
	// git
	FAILED_TO_RUN_GIT_CLONE = 'FAILED_TO_RUN_GIT_CLONE',
	FAILED_TO_GET_GIT_TAGS_FROM_REMOTE = 'FAILED_TO_GET_GIT_TAGS_FROM_REMOTE',
	FAILED_TO_PARSE_GIT_TAGS_FROM_OUTPUT = 'FAILED_TO_PARSE_GIT_TAGS_FROM_OUTPUT',
}

export type TelemetryErrorEvent = TelemetryErrorEventNames | string;

export const enum TelemetryEventNames {
	Startup = 'STARTUP',
	/**
	 * First ever extension activation.
	 */
	NewInstall = 'NEW_INSTALL',
	/**
	 * Enable gitops event (flux install).
	 */
	EnableGitOps = 'ENABLE_GITOPS',
	/**
	 * Disable gitops event (flux uninstall).
	 */
	DisableGitOps = 'DISABLE_GITOPS',
	/**
	 * Pressed `+` button to open the webview editor.
	 */
	CreateSourceOpenWebview = 'CREATE_SOURCE_OPEN_WEBVIEW',
	/**
	 * Create/delete Flux Source event.
	 */
	CreateSource = 'CREATE_SOURCE',
	ExportSource = 'EXPORT_SOURCE',
	DeleteSource = 'DELETE_SOURCE',
	/**
	 * Create/delete Flux Workload (Kustomization, HelmRelease) event.
	 */
	CreateWorkload = 'CREATE_WORKLOAD',
	DeleteWorkload = 'DELETE_WORKLOAD',
}

/**
 * Map event names with the data type of payload sent
 * When undefined - send only the event name.
 */
interface TelemetryEventNamePropertyMapping {
	[TelemetryEventNames.Startup]: undefined;
	[TelemetryEventNames.EnableGitOps]: {
		clusterProvider: string;
	};
	[TelemetryEventNames.DisableGitOps]: {
		clusterProvider: string;
	};
	[TelemetryEventNames.NewInstall]: undefined;
	[TelemetryEventNames.CreateSourceOpenWebview]: undefined;
	[TelemetryEventNames.CreateSource]: {
		kind: string;
	};
	[TelemetryEventNames.DeleteSource]: {
		kind: string;
	};
	[TelemetryEventNames.CreateWorkload]: {
		kind: string;
	};
	[TelemetryEventNames.DeleteWorkload]: {
		kind: string;
	};
}

export class Telemetry {

	private context: ExtensionContext;
	private reporter: TelemetryReporter;

	constructor(context: ExtensionContext, extensionVersion: string, extensionId: string) {
		this.context = context;
		const key = '9a491deb-120a-4a6e-8893-f528d4f6bd9c';
		this.reporter = new TelemetryReporter(extensionId, extensionVersion, key);
	}

	/**
	 * Check if it's allowed to send the telemetry.
	 */
	private canSend(): boolean {
		// Don't send telemetry when developing or testing the extension
		if (this.context.extensionMode !== ExtensionMode.Production) {
			return false;
		}
		// Don't send telemetry when user disabled it in Settings
		if (!env.isTelemetryEnabled) {
			return false;
		}
		return true;
	}

	/**
	 * Send custom events.
	 *
	 * @param eventName sent message title
	 * @param payload custom properties to add to the message
	 */
	send<T extends TelemetryEventNamePropertyMapping, E extends keyof T>(eventName: E, payload?: T[E]): void {
		if (!this.canSend()) {
			return;
		}

		// @ts-ignore
		this.reporter.sendTelemetryEvent(eventName, payload);
	}

	/**
	 * Send caught or uncaught errors.
	 *
	 * @param eventName sent message title
	 * @param error error object of the uncaught exception
	 */
	sendError(eventName: TelemetryErrorEvent, error?: Error): void {
		if (!this.canSend()) {
			return;
		}

		if (!error) {
			error = new Error(eventName);
		}

		this.reporter.sendTelemetryException(error, {
			name: eventName,
		});

	}

	dispose(): void {
		this.reporter.dispose();
	}
}
