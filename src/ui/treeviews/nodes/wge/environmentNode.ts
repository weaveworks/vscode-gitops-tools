import { getResource } from 'cli/kubernetes/kubectlGet';
import { getNamespace } from 'cli/kubernetes/kubectlGetNamespace';
import { GitOpsCluster } from 'types/flux/gitOpsCluster';
import { Environment, Pipeline, Target } from 'types/flux/pipeline';
import { Kind } from 'types/kubernetes/kubernetesTypes';
import { wgeDateProvider } from 'ui/treeviews/treeViews';
import { makeTreeNode } from '../makeTreeNode';
import { TreeNode } from '../treeNode';

export class PipelineEnvironmentNode extends TreeNode {
	environment: Environment;
	pipepine: Pipeline;

	constructor(environment: Environment, pipeline: Pipeline) {
		super(environment.name, wgeDateProvider);

		this.makeCollapsible();
		this.environment = environment;
		this.pipepine = pipeline;

		this.description = 'Environment';
	}

	async updateChildren() {
		const targets = this.environment.targets;
		for(const target of targets) {
			const targetCluster = await this.getTargetCluster(target);
			const targetNode = new PipelineTargetNode(target, targetCluster);
			targetNode.updateChildren();
			this.addChild(targetNode);
		}
		this.redraw();
	}

	async getTargetCluster(target: Target): Promise<GitOpsCluster | undefined> {
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
	target: Target;
	targetCluster?: GitOpsCluster;

	constructor(target: Target, targetCluster?: GitOpsCluster) {
		const clusterLabel = targetCluster ? `${targetCluster.metadata.name}.${targetCluster.metadata.namespace}` : '(this cluster)';
		super(`${clusterLabel} ${target.namespace}`, wgeDateProvider);

		this.target = target;
		this.targetCluster = targetCluster;

		this.makeCollapsible();

		this.description = 'Target';
	}

	async updateChildren() {
		if(this.targetCluster) {
			const gopsClusterNode = makeTreeNode(this.targetCluster, wgeDateProvider);
			this.addChild(gopsClusterNode);

			const crossClusterNsNode = new TreeNode(this.target.namespace, wgeDateProvider);
			crossClusterNsNode.description = `Namespace in ${this.targetCluster.metadata.name}`;
			this.addChild(crossClusterNsNode);
		} else {
			// local target cluster
			const localNamespace = await getNamespace(this.target.namespace);
			if(localNamespace) {
				this.addChild(makeTreeNode(localNamespace, wgeDateProvider));
			}
		}

		this.redraw();
	}






}

