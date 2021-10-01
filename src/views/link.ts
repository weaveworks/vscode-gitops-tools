/**
 * Link interface for documentation tree view.
 */
export interface Link {
	title: string;
	url: string;
	links?: Link[];
}
