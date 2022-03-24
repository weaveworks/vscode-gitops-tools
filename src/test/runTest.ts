import * as path from 'path';
import * as cp from 'child_process';

import { runTests, downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';

async function main() {
	try {
		//  --extensionDevelopmentPath
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');
		//  --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		// Download VS Code, unzip it and run the integration test
		// await runTests({ vscodeExecutablePath, extensionDevelopmentPath, extensionTestsPath });
		await runTests({ extensionDevelopmentPath, extensionTestsPath });
		console.log('DONE RUNNING TESTS');
	} catch (err) {
		console.error('Failed to run tests');
		console.error(err);
		process.exit(1);
	}
}

main();
