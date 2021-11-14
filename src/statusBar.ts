import { StatusBarAlignment, StatusBarItem, window } from 'vscode';

class StatusBar {

	public statusBarItem: StatusBarItem;
	private statusBarItemName = 'gitops';

	private numberOfLoadingTreeViews = 0;
	private loadingWasHidden = false;

	constructor() {
		this.statusBarItem = window.createStatusBarItem(
			this.statusBarItemName,
			StatusBarAlignment.Left,
			-1e10,// align to the right
		);
		this.statusBarItem.text = '$(sync~spin) GitOps: Initializing Tree Views';
	}

	/**
	 * Show initialization message in status bar
	 * (only at the extension initialization (once))
	 */
	startLoadingTree(): void {
		if (this.loadingWasHidden) {
			return;
		}

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
			this.loadingWasHidden = true;
			this.statusBarItem.hide();
			this.statusBarItem.dispose();
		}
	}
}

/**
 * Status bar for showing extension initialization message.
 */
export const statusBar = new StatusBar();
