import { shell } from '../shell';

/**
 * Wrap file path in quotes depending on the user os.
 * (To allow paths with whitespaces, for example).
 * @param fsPath target file system path
 * @returns quoted file system path
 */
export function quoteFsPath(fsPath: string) {
	const quoteSymbol = shell.isWindows() ? '"' : '\'';
	return `${quoteSymbol}${fsPath}${quoteSymbol}`;
}
