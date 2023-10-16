import { ThemeColor, ThemeIcon } from 'vscode';

export const enum CommonIcon {
	Error = 'error',
	Warning = 'warning',
	Success = 'success',
	Disconnected = 'disconnected',
	Progressing = 'progressing',
	Loading = 'loading',
	Unknown = 'unknown',
}

const IconDefinitions: Record<string, [string, string]> = {
	[CommonIcon.Error]: ['error', 'editorError.foreground'],
	[CommonIcon.Warning]: ['warning', 'editorWarning.foreground'],
	[CommonIcon.Success]: ['pass', 'terminal.ansiGreen'],
	[CommonIcon.Disconnected]: ['sync-ignored', 'editorError.foreground'],
	[CommonIcon.Progressing]: ['sync~spin', 'terminal.ansiGreen'],
	[CommonIcon.Loading]: ['loading~spin', 'foreground'],
	[CommonIcon.Unknown]: ['circle-large-outline', 'foreground'],
};

export function themeIcon(icon: CommonIcon) {
	const [id, color] = IconDefinitions[icon];
	return new ThemeIcon(id, new ThemeColor(color));
}

