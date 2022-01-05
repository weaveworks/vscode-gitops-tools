import { env, ExtensionMode } from 'vscode';
import TelemetryReporter from 'vscode-extension-telemetry';
import { getExtensionVersion } from './commands/showInstalledVersions';
import { GitOpsExtensionConstants } from './extension';
import { getExtensionContext } from './extensionContext';

type TelemetryEvent = 'STARTUP' | 'EXECUTE_COMMAND';
type SpecificErrorEvent = 'KUBERNETES_TOOLS_API_UNAVAILABLE' | 'FAILED_TO_GET_KUBECTL_CONFIG' | 'FAILED_TO_GET_CURRENT_KUBERNETES_CONTEXT' | 'FAILED_TO_SET_CURRENT_KUBERNETES_CONTEXT' | 'FAILED_TO_GET_CHILDREN_OF_A_WORKLOAD' | 'FAILED_TO_GET_NODES_TO_DETECT_AKS_CLUSTER' | 'FAILED_TO_GET_CONFIGMAPS_TO_DETECT_ARC_CLUSTER';
type ErrorEvent = 'UNCAUGHT_EXCEPTION' | 'CAUGHT_ERROR' | SpecificErrorEvent;

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
	send(eventName: TelemetryEvent, payload?: Record<string, string>): void {
		if (!this.canSend()) {
			return;
		}

		if (eventName === 'EXECUTE_COMMAND') {
			this.reporter.sendTelemetryEvent(`${eventName}:${payload?.commandId}`, payload);
		} else {
			this.reporter.sendTelemetryEvent(eventName, payload);
		}
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

