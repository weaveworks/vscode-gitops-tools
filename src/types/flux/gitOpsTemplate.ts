import { KubernetesObject, KubernetesObjectKinds, ObjectMeta, ResultMetadata } from 'types/kubernetes/kubernetesTypes';

/**
 * `kubectl get GitOpsTemplate -A` command.
 */
export interface GitOpsTemplateResult {
	readonly apiVersion: string;
	readonly kind: KubernetesObjectKinds.List;
	readonly items: GitOpsTemplate[];
	readonly metadata: ResultMetadata;
}


export interface GitOpsTemplate extends KubernetesObject {
	// standard kubernetes object fields
	readonly apiVersion: string;
	readonly kind: KubernetesObjectKinds.GitOpsTemplate;
	readonly metadata: ObjectMeta;

	readonly spec: {
		readonly params?: TemplateParam[];
		readonly description?: string;
	};

	readonly status?: any;
}

/**
 * params spec for GitOpsTempalte
 */
export interface TemplateParam {
	readonly name: string;
	readonly description: string;
	readonly options?: string[];
	readonly default?: string;
	readonly required?: boolean;
}


