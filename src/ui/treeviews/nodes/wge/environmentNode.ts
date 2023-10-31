import { getResource } from 'cli/kubernetes/kubectlGet';
import { GitOpsCluster } from 'types/flux/gitOpsCluster';
import { LocalAppReference, Pipeline, PipelineEnvironment, PipelineTarget } from 'types/flux/pipeline';
import { Kind, KubernetesObject } from 'types/kubernetes/kubernetesTypes';
import { themeIcon } from 'ui/icons';
import { wgeDataProvider } from 'ui/treeviews/treeViews';
import { makeTreeNode } from '../makeTreeNode';
import { TreeNode } from '../treeNode';

export class PipelineEnvironmentNode extends TreeNode {
	environment: PipelineEnvironment;
	pipepine: Pipeline;

	constructor(environment: PipelineEnvironment, pipeline: Pipeline) {
		super(environment.name, wgeDataProvider);

		this.makeCollapsible();
		this.environment = environment;
		this.pipepine = pipeline;

		this.description = 'Environment';
	}

	async updateChildren() {
		const targets = this.environment.targets;
		for(const target of targets) {
			const targetCluster = await this.getTargetCluster(target);
			const appRef = this.pipepine.spec.appRef;
			const targetNode = new PipelineTargetNode(target, appRef, targetCluster);
			targetNode.updateChildren();
			this.addChild(targetNode);
		}
		this.redraw();
	}

	async getTargetCluster(target: PipelineTarget): Promise<GitOpsCluster | undefined> {
		if(target.clusterRef) {
			const namespace = target.clusterRef.namespace || this.pipepine.metadata.namespace || 'default';
			const cluster = await getResource<GitOpsCluster>(target.clusterRef.name, namespace, target.clusterRef.kind as Kind);
			return cluster;
		}
		// if no clusterRef is set then the current cluster is the target cluster
		return undefined;
	}
}


export class PipelineTargetNode extends TreeNode {
	target: PipelineTarget;
	targetCluster?: GitOpsCluster;
	appRef: LocalAppReference;

	constructor(target: PipelineTarget, appRef: LocalAppReference, targetCluster?: GitOpsCluster) {
		const clusterLabel = targetCluster ? `${targetCluster.metadata.name}.${targetCluster.metadata.namespace}` : '(this cluster)';
		super(`${clusterLabel} ${appRef.name}.${target.namespace}`, wgeDataProvider);

		this.target = target;
		this.targetCluster = targetCluster;
		this.appRef = appRef;

		this.makeCollapsible();

		this.description = 'Target';
	}

	async updateChildren() {
		if(this.targetCluster) {
			const gopsClusterNode = makeTreeNode(this.targetCluster, wgeDataProvider);
			this.addChild(gopsClusterNode);

			const crossClusterAppNode = new TreeNode(`${this.appRef.name}.${this.target.namespace}`, wgeDataProvider);
			crossClusterAppNode.description = `${this.appRef.kind} (in ${this.targetCluster.metadata.name})`;
			crossClusterAppNode.setIcon(themeIcon('link-external', 'descriptionForeground'));
			this.addChild(crossClusterAppNode);
		} else {
			const localHr = await getResource<KubernetesObject>(this.appRef.name, this.target.namespace, this.appRef.kind as Kind);
			if(localHr) {
				const localAppNode = makeTreeNode(localHr, wgeDataProvider);
				localAppNode.label = `${this.appRef.kind}: ${this.appRef.name}.${this.target.namespace}`;
				localAppNode.updateChildren();
				this.addChild(localAppNode);
			}
		}

		this.redraw();
	}






}

