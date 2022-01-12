import { env, ExtensionMode } from 'vscode';
import TelemetryReporter from 'vscode-extension-telemetry';
import { getExtensionVersion } from './commands/showInstalledVersions';
import { GitOpsExtensionConstants } from './extension';
import { getExtensionContext } from './extensionContext';

type SpecificErrorEvent = 'KUBERNETES_TOOLS_API_UNAVAILABLE' | 'FAILED_TO_GET_KUBECTL_CONFIG' | 'FAILED_TO_GET_CURRENT_KUBERNETES_CONTEXT' | 'FAILED_TO_SET_CURRENT_KUBERNETES_CONTEXT' | 'FAILED_TO_GET_CHILDREN_OF_A_WORKLOAD' | 'FAILED_TO_GET_NODES_TO_DETECT_AKS_CLUSTER' | 'FAILED_TO_GET_CONFIGMAPS_TO_DETECT_ARC_CLUSTER';
type ErrorEvent = 'UNCAUGHT_EXCEPTION' | 'CAUGHT_ERROR' | SpecificErrorEvent;

export const enum TelemetryEventNames {
	/**
	 * Extension startup event.
	 */
	Startup = 'STARTUP',
	/**
	 * Enable gitops event (flux install).
	 */
	EnableGitOps = 'ENABLE_GITOPS',
	/**
	 * Disable gitops event (flux uninstall).
	 */
	DisableGitOps = 'DISABLE_GITOPS',
	/**
	 * First ever extension activation.
	 */
	NewInstall = 'NEW_INSTALL',
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
}

class Telemetry {
	private reporter: TelemetryReporter;

	constructor(extensionVersion: string) {
		const key = 'da19a1446ba2-369b-0484-b857-e706cf38'.split('').reverse().join('');
		this.reporter = new TelemetryReporter(GitOpsExtensionConstants.ExtensionId, extensionVersion, key);
	}

	/**
	 * Check if it's allowed to send the telemetry.
	 */
	private canSend(): boolean {
		// Don't send telemetry when developing or testing the extension
		if (getExtensionContext().extensionMode !== ExtensionMode.Production) {
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
	sendError(eventName: ErrorEvent, error?: Error): void {
		if (!this.canSend()) {
			return;
		}

		if (error) {
			this.reporter.sendTelemetryException(error, {
				name: eventName,
			});
		} else {
			this.reporter.sendTelemetryEvent(eventName);
		}

	}

	dispose(): void {
		this.reporter.dispose();
	}
}

/**
 * Methods to report telemetry over Application Insights (Exceptions or Custom Events).
 */
export const telemetry = new Telemetry(getExtensionVersion());

