/**
 * Defines Kubernetes file schemes
 * used by the virtual Kubernetes Tools file system provider
 * to open kubernetes object config files in vscode editor.
 * @see https://github.com/Azure/vscode-kubernetes-tools/blob/master/src/kuberesources.virtualfs.ts
 */
export const enum KubernetesFileSchemes {
	Resource = 'k8smsx',
	ReadonlyResource = 'k8smsxro',
	KubectlResource = 'loadkubernetescore',
	DescribeResource = 'kubernetesdescribe',
	HelmResource = 'helmget',
}
