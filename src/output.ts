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

	// add output message
	if (channel) {
		if (revealOutputView) {
			channel.show(true);
		}
		if (addNewline && !message.endsWith('\n')) {
			message = `${message} \n`;
		}
		channel.append(message);
	} else {
		console.log(message);
	}
}

export function showOutputChannel() {
	outputChannel.show();
}
