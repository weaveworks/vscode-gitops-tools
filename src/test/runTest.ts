import * as path from 'path';
import which from 'which';
import * as shelljs from 'shelljs';


import { runTests, downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';

async function main() {
	try {
		//  --extensionDevelopmentPath
		let extensionDevelopmentPath = path.resolve(__dirname, '../../');
		//  --extensionTestsPath
		let extensionTestsPath = path.resolve(__dirname, './suite/index');

		await runTests({ extensionDevelopmentPath, extensionTestsPath });
	} catch (err) {
		console.error('Failed to run tests');
		console.error(err);
		process.exit(1);
	}
}

main();
