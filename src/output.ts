import {
  OutputChannel,
  window
} from 'vscode';

export let outputChannel: OutputChannel;

const outputChannelName: string = 'GitOps Output';

export async function sendToOutputChannel(message: string = '', addNewline: boolean = true, channel?: OutputChannel) : Promise<void> {
	// create output channel
	if (!outputChannel) {
		outputChannel = window.createOutputChannel(outputChannelName);
	}
	if (!channel && outputChannel) {
		channel = outputChannel;
	}

  // add output message
	if (channel) {
		channel.show(true);
		if (addNewline && !message.endsWith('\n')) {
			message = `${message} \n`;
		}
		channel.append(message);
	}
  else {
		console.log(message);
	}
}
