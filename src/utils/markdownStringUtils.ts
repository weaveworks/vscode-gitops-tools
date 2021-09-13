import { MarkdownString } from 'vscode';

/**
 * Create specific table header (2 columns, left aligned)
 * for the tree view item hover.
 */
export function generateMarkdownTableHeader(markdown: MarkdownString) {
	markdown.appendMarkdown('Property | Value\n');
	markdown.appendMarkdown(':--- | :---\n');
}
/**
 * Create markdown table row (only if value is not equal `undefined`)
 */
export function generateMarkdownTableRow(propertyName: string, propertyValue: string | boolean | undefined, markdown: MarkdownString) {
	if (propertyValue === undefined) {
		return;
	}
	markdown.appendMarkdown(`${propertyName} | ${propertyValue}\n`);
}
