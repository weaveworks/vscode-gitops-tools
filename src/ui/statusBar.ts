import { StatusBarAlignment, StatusBarItem, window } from 'vscode';

class StatusBar {

	private statusBarItem: StatusBarItem;
	private statusBarItemName = 'gitops';

	private numberOfLoadingTreeViews = 0;

	constructor() {
		this.statusBarItem = window.createStatusBarItem(
			this.statusBarItemName,
			StatusBarAlignment.Left,
			-1e10,// align to the right
		);
		this.statusBarItem.text = '$(sync~spin) GitOps: Loading Resources';
	}

	/**
	 * Show initialization message in status bar
	 * (only at the extension initialization (once))
	 */
	startLoadingTree(): void {
		this.numberOfLoadingTreeViews++;
		this.statusBarItem.show();
	}

	/**
	 * Stop initialization of one tree view.
	 * (if some tree views are still loading - don't hide yet).
	 */
	stopLoadingTree(): void {
		this.numberOfLoadingTreeViews--;

		if (this.numberOfLoadingTreeViews === 0) {
			this.statusBarItem.hide();
		}
	}

	dispose() {
		this.statusBarItem.dispose();
	}
}

/**
 * Status bar for showing extension initialization message.
 */
export const statusBar = new StatusBar();
