import { WebviewPanel } from 'vscode';

import { actionCreate, actionYAML } from './actions';

export async function receiveMessage(message: any, panel: WebviewPanel) {
	switch (message.action) {
		case 'create':
			actionCreate(message.data);
			panel.dispose();
			return;
		case 'show-yaml':
			actionYAML(message.data);
			return;
	}
}
