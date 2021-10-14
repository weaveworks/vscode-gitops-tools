import { StatusBarAlignment, StatusBarItem, window } from 'vscode';

/**
 * Status bar to use for all GitOps status updates.
 */
class StatusBar {

	public status: StatusBarItem;
	private statusBarItemName: string = 'gitops';

	/**
	 * Creates GitOps status bar item to use for all status updates.
	 */
	constructor() {
		this.status = window.createStatusBarItem(
			this.statusBarItemName,
			StatusBarAlignment.Left,
			4,// priority
		);
	}

	/**
	 * Shows message in GitOps status bar.
	 * @param message The text message to show.
	 */
	show(message: string): void {
		this.status.text = `$(sync~spin) ${message}`;
		this.status.show();

		// If clusters tree view is collapsed - the status bar loading
		// is stuck on intinite loading
		// Workaround it by hiding the loading message after 15s
		setTimeout(() => {
			this.hide();
		}, 15000);
	}

	/**
	 * Hides GitOps status display.
	 */
	hide(): void {
		this.status.hide();
	}
}

export const statusBar = new StatusBar();
