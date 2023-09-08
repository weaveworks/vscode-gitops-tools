import TelemetryReporter from '@vscode/extension-telemetry';
import { env, ExtensionContext, ExtensionMode } from 'vscode';

import { TelemetryErrorEvent, TelemetryEvent } from 'types/telemetryEventNames';

/**
 * Map event names with the data type of payload sent
 * When undefined - send only the event name.
 */
interface TelemetryEventNamePropertyMapping {
	[TelemetryEvent.Startup]: undefined;
	[TelemetryEvent.EnableGitOps]: {
		clusterProvider: string;
	};
	[TelemetryEvent.DisableGitOps]: {
		clusterProvider: string;
	};
	[TelemetryEvent.NewInstall]: undefined;
	[TelemetryEvent.CreateSourceOpenWebview]: undefined;
	[TelemetryEvent.CreateSource]: {
		kind: string;
	};
	[TelemetryEvent.DeleteSource]: {
		kind: string;
	};
	[TelemetryEvent.CreateWorkload]: {
		kind: string;
	};
	[TelemetryEvent.DeleteWorkload]: {
		kind: string;
	};
}

export class Telemetry {

	private context: ExtensionContext;
	private reporter: TelemetryReporter;

	constructor(context: ExtensionContext, extensionVersion: string, extensionId: string) {
		// second and third arguments are no longer accepted by TelemetryReporter constructor
		this.context = context;
		const key = '9a491deb-120a-4a6e-8893-f528d4f6bd9c';
		this.reporter = new TelemetryReporter(key);
		context.subscriptions.push(this.reporter);
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

		this.reporter.sendTelemetryEvent(String(error), {
			name: eventName,
		});

	}

	dispose(): void {
		this.reporter.dispose();
	}
}
