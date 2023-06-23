import { Uri } from 'vscode';
import { extensionContext } from '../extension';

export function asAbsolutePath(relativePath: string): Uri {
	return Uri.file(extensionContext.asAbsolutePath(relativePath));
}
