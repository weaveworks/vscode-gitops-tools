
/**
 * Link interface for documentation tree view.
 */
export interface DocumentationLink {
	title: string;
	url: string;
	icon?: string;
	links?: DocumentationLink[];
	webview?: boolean;
}

/**
 * links config for GitOps Documentation tree view.
 */
export const documentationLinks: DocumentationLink[] = [
	{
		title: 'GitOps VSCode Docs',
		url: 'https://github.com/weaveworks/vscode-gitops-tools',
		icon: 'resources/icons/flux-logo.png',
		webview: true,
	},
	{
		title: 'Flux',
		url: 'https://fluxcd.io/docs',
		icon: 'resources/icons/flux-logo.png',
		links: [
			{
				title: 'Core Concepts',
				url: 'https://fluxcd.io/docs/concepts',
			},
			{
				title: 'Get Started with Flux',
				url: 'https://fluxcd.io/docs/get-started',
			},
			{
				title: 'Installation',
				url: 'https://fluxcd.io/docs/installation',
			},
			{
				title: 'User Guides',
				url: 'https://fluxcd.io/docs/guides',
			},
			{
				title: 'Use Cases',
				url: 'https://fluxcd.io/docs/use-cases',
			},
			{
				title: 'Migration',
				url: 'https://fluxcd.io/docs/migration',
			},
			{
				title: 'GitOps Toolkit components',
				url: 'https://fluxcd.io/docs/components',
			},
			{
				title: 'Toolkit Dev Guides',
				url: 'https://fluxcd.io/docs/gitops-toolkit',
			},
			{
				title: 'Flux CLI',
				url: 'https://fluxcd.io/docs/cmd',
			},
			{
				title: 'Flux FAQ',
				url: 'https://fluxcd.io/docs/faq',
			},
		],
	},
	{
		title: 'Azure Kubernetes',
		url: 'https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/conceptual-gitops-flux2',
		icon: 'resources/icons/azure-logo.png',
		links: [
			{
				title: 'Conceptual GitOps with Flux v2',
				url: 'https://docs.microsoft.com/en-us/azure/azure-arc/kubernetes/conceptual-gitops-flux2',
			},
			{
				title: 'Tutorial GitOps with Flux v2',
				url: 'https://docs.microsoft.com/azure/azure-arc/kubernetes/tutorial-use-gitops-flux2',
			},
			{
				title: 'Conceptual CI/CD with GitOps Flux v2',
				url: 'https://docs.microsoft.com/azure/azure-arc/kubernetes/conceptual-gitops-flux2-ci-cd',
			},
			{
				title: 'Tutorial CI/CD with GitOps Flux v2',
				url: 'https://docs.microsoft.com/azure/azure-arc/kubernetes/tutorial-gitops-flux2-ci-cd',
			},
			{
				title: 'Troubleshooting',
				url: 'https://docs.microsoft.com/azure/azure-arc/kubernetes/troubleshooting#gitops-management',
			},
		],
	},
	{
		title: 'Weave GitOps',
		url: 'https://docs.gitops.weave.works',
		icon: 'resources/icons/gitops-logo.png',
		links: [
			{
				title: 'Introduction',
				url: 'https://docs.gitops.weave.works/docs/intro',
			},
			{
				title: 'Installing the CLI',
				url: 'https://docs.gitops.weave.works/docs/installation',
			},
			{
				title: 'Getting Started',
				url: 'https://docs.gitops.weave.works/docs/getting-started',
			},
			{
				title: 'CLI Reference',
				url: 'https://docs.gitops.weave.works/docs/cli-reference',
			},
			{
				title: 'Architecture',
				url: 'https://docs.gitops.weave.works/docs/architecture',
			},
			{
				title: 'Troubleshooting',
				url: 'https://docs.gitops.weave.works/docs/troubleshooting',
			},
			{
				title: 'GitOps Automation Configuration',
				url: 'https://docs.gitops.weave.works/docs/gitops-automation',
			},
		],
	},
];
