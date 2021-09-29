import { ExtensionContext } from 'vscode';
import {
	ContextTypes,
	setContext
} from '../../context';
import { kubernetesTools } from '../../kubernetes/kubernetesTools';
import { ApplicationNode } from '../nodes/applicationNode';
import { HelmReleaseNode } from '../nodes/helmReleaseNode';
import { KustomizationNode } from '../nodes/kustomizationNode';
import { DataProvider } from './dataProvider';

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

		setContext(ContextTypes.LoadingApplications, true);

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

		setContext(ContextTypes.LoadingApplications, false);
		setContext(ContextTypes.NoApplications, treeItems.length === 0);

    return treeItems;
  }
}
