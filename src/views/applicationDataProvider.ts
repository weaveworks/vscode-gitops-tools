import { ExtensionContext } from 'vscode';
import { kubernetesTools } from '../kubernetes/kubernetesTools';
import { DataProvider } from './dataProvider';
import { ApplicationNode } from './applicationNode';
import { KustomizationNode } from './kustomizationNode';
import { HelmReleaseNode } from './helmReleaseNode';

/**
 * Defines Applications data provider for loading Kustomizations
 * and Helm Releases in GitOps Applictions tree view.
 */
export class ApplicationDataProvider extends DataProvider {
	constructor(private extensionContext: ExtensionContext) {
		super();
	}

	/**
   * Creates Application tree view items for the currently selected kubernetes cluster.
   * @returns Application tree view items to display.
   */
  async buildTree(): Promise<ApplicationNode[]> {
		const treeItems: ApplicationNode[] = [];

		// load application kustomizations
    const kustomizations = await kubernetesTools.getKustomizations();
    if (kustomizations) {
			for (const kustomizeApplication of kustomizations.items) {
				treeItems.push(new KustomizationNode(kustomizeApplication));
			}
    }

		// load application helm releases
		const helmReleases = await kubernetesTools.getHelmReleases();
		if (helmReleases) {
			for (const helmRelease of helmReleases.items) {
				treeItems.push(new HelmReleaseNode(helmRelease));
			}
		}
    return treeItems;
  }
}
