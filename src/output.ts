import { OutputChannel, window } from 'vscode';

type OutputChannelName = 'GitOps' | 'GitOps: kubectl';

class Output {
	/** Main GitOps output channel.	 */
	private channel: OutputChannel;
	/** Channel for kubectl commands output (json) */
	private kubectlChannel: OutputChannel;

	constructor() {
		this.channel = window.createOutputChannel('GitOps' as OutputChannelName);
		this.kubectlChannel = window.createOutputChannel('GitOps: kubectl' as OutputChannelName);
	}

	/**
	 * Send a message to one of the Output Channels of this extension.
	 *
	 * TODO: 3 options for newline: none, enforce1(next message should be on new line), enforce 2(make 1 empty line between items)
	 */
	send(
		message: string,
		{
			addNewline = true,
			revealOutputView = true,
			logLevel = 'info',
			channelName = 'GitOps',
		}: {
			addNewline?: boolean;
			revealOutputView?: boolean;
			logLevel?: 'info' | 'warn' | 'error';
			channelName?: OutputChannelName;
		} = {},
	): void {

		let channel = this.getChannelByName(channelName);

		if (!channel) {
			channel = window.createOutputChannel(channelName);
			if (channelName === 'GitOps') {
				this.channel = channel;
			} else if (channelName === 'GitOps: kubectl') {
				this.kubectlChannel = channel;
			}
		}

		if (revealOutputView) {
			channel.show(true);
		}

		if (logLevel === 'warn') {
			message = `WARN ${message}`;
		} else if (logLevel === 'error') {
			message = `ERROR ${message}`;
		}

		if (addNewline) {
			if (message.endsWith('\n')) {
				message += '\n';
			} else {
				message += '\n\n';
			}
		}

		channel.append(message);
	}

	/**
	 * Show and focus main output channel.
	 */
	show(): void {
		this.channel.show();
	}

	/**
	 * Return Output channel from its name.
	 *
	 * @param channelName Target Output Channel name
	 */
	private getChannelByName(channelName: OutputChannelName): OutputChannel | undefined {
		if (channelName === 'GitOps') {
			return this.channel;
		} else if (channelName === 'GitOps: kubectl') {
			return this.kubectlChannel;
		}
	}
}

/**
 * Output view of this extension.
 */
export const output = new Output();

/**
 * @see {@link output.show}
 */
export function showOutputChannel() {
	output.show();
}
