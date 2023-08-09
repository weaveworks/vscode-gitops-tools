import * as shell from 'cli/shell/exec';
import { v4 as uuidv4 } from 'uuid';
import { Uri, WebviewPanel, workspace } from 'vscode';

export async function receiveMessage(message: any, panel: WebviewPanel) {
	switch (message.action) {
		case 'show-yaml':
			// actionYAML(message.data);
			console.log(message.data);
			const data = message.data;

			renderTemplates(data.template, data.values);
			panel.dispose();
			return;
	}
}


async function renderTemplates(template: Record<string,string>, values: Record<string,string>) {
	const valuesArg = Object.entries(values).map(e => `${e[0]}=${e[1]}`).join(',');

	// download template
	const fname = `${template.folder}/${template.name}-${uuidv4()}.yaml`;

	const commandFetch = `kubectl get gitopstemplate ${template.name} -n ${template.namespace} -o yaml > ${fname}`;
	const commandRender = `gitops create template --template-file '${fname}' --output-dir ${template.folder} --values ${valuesArg}`;
	try {
		await shell.execWithOutput(commandFetch);
		const shellResult = await shell.execWithOutput(commandRender);
	} finally {
		workspace.fs.delete(Uri.file(fname));
	}
}
