import { OutputChannel, window } from 'vscode';

export let outputChannel: OutputChannel;

const outputChannelName: string = 'GitOps';

export async function sendToOutputChannel(
	message: string = '',
	addNewline: boolean = true,
	revealOutputView: boolean = true,
	channel?: OutputChannel): Promise<void> {

	// create output channel
	if (!outputChannel) {
		outputChannel = window.createOutputChannel(outputChannelName);
	}
	if (!channel && outputChannel) {
		channel = outputChannel;
	}

	if (!channel) {
		console.log(message);
		return;
	}

	if (revealOutputView) {
		channel.show(true);
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

export function showOutputChannel() {
	outputChannel.show();
}
