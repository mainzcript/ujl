import { withMermaid } from "vitepress-plugin-mermaid";

const siteUrl = "https://ujl-framework.org";
const ogImageUrl = `${siteUrl}/og/ujl-og.jpg`;

// https://vitepress.dev/reference/site-config
export default withMermaid({
	srcDir: "src",
	outDir: "dist",

	title: "UJL Framework",
	titleTemplate: ":title | UJL Framework",
	description:
		"UJL is an AI-native framework that generates accessible, on-brand UI from structured content and design rules.",
	lang: "en",
	base: "/",
	lastUpdated: true,
	sitemap: {
		hostname: siteUrl,
	},
	head: [
		["link", { rel: "icon", href: "/assets/logo-icon.png" }],
		["meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }],
		["meta", { property: "og:site_name", content: "UJL Framework" }],
		["meta", { property: "og:type", content: "website" }],
		["meta", { name: "twitter:card", content: "summary_large_image" }],
		["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
		["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
		[
			"link",
			{
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@700&display=swap",
				rel: "stylesheet",
			},
		],
	],
	transformPageData(pageData) {
		const head = pageData.frontmatter.head ?? [];
		pageData.frontmatter.head = head;

		const title = pageData.frontmatter.title ?? pageData.title ?? "UJL Framework";
		const description =
			pageData.frontmatter.description ??
			pageData.description ??
			"UJL is an AI-native framework that generates accessible, on-brand UI from structured content and design rules.";

		let canonicalPath = pageData.relativePath ?? "";
		if (canonicalPath.endsWith("index.md")) {
			canonicalPath = canonicalPath.slice(0, -"index.md".length);
		} else if (canonicalPath.endsWith(".md")) {
			canonicalPath = `${canonicalPath.slice(0, -3)}.html`;
		}
		if (canonicalPath === "") canonicalPath = "/";
		if (!canonicalPath.startsWith("/")) canonicalPath = `/${canonicalPath}`;

		const canonicalUrl = `${siteUrl}${canonicalPath}`;

		head.push(
			["link", { rel: "canonical", href: canonicalUrl }],
			["meta", { property: "og:title", content: title }],
			["meta", { property: "og:description", content: description }],
			["meta", { property: "og:url", content: canonicalUrl }],
			["meta", { property: "og:image", content: ogImageUrl }],
			["meta", { property: "og:image:width", content: "1200" }],
			["meta", { property: "og:image:height", content: "630" }],
			["meta", { name: "twitter:title", content: title }],
			["meta", { name: "twitter:description", content: description }],
			["meta", { name: "twitter:image", content: ogImageUrl }],
		);
	},

	themeConfig: {
		logo: "/assets/logo-icon.png",

		nav: [
			{ text: "Getting Started", link: "/guide/quickstart" },
			{ text: "Reference", link: "/reference/overview" },
			{ text: "About", link: "/about/vision" },
		],

		sidebar: [
			{
				text: "How to ...",
				collapsed: false,
				items: [
					{ text: "Get Started", link: "/guide/quickstart" },
					{ text: "Install & Integrate", link: "/guide/installation" },
					{ text: "Understand UJL", link: "/guide/concepts" },
					{ text: "Implement Custom Modules", link: "/guide/custom-modules" },
					{ text: "Optimize Bundle Size", link: "/guide/optimize-bundle-size" },
				],
			},
			{
				text: "Reference",
				collapsed: false,
				items: [
					{ text: "Overview", link: "/reference/overview" },
					{ text: "Packages", link: "/reference/packages" },
					{
						text: "Decisions (ADRs)",
						collapsed: true,
						items: [
							{
								text: "ADR-001 Content/Design Separation",
								link: "/reference/decisions/0001-content-design-separation",
							},
							{
								text: "ADR-002 Registry & Plugin System",
								link: "/reference/decisions/0002-registry-plugin-system",
							},
							{
								text: "ADR-003 AST Adapter Pattern",
								link: "/reference/decisions/0003-ast-adapter-pattern",
							},
							{
								text: "ADR-004 Dual Image Storage",
								link: "/reference/decisions/0004-dual-image-storage",
							},
							{
								text: "ADR-005 Zod Schema Validation",
								link: "/reference/decisions/0005-zod-schema-validation",
							},
							{
								text: "ADR-009 OKLCH Color Space",
								link: "/reference/decisions/0009-oklch-color-space",
							},
							{
								text: "ADR-019 Structured Content",
								link: "/reference/decisions/0019-structured-content-over-html",
							},
							{
								text: "ADR-020 Foreground Mapping",
								link: "/reference/decisions/0020-foreground-mapping-wcag",
							},
						],
					},
					{ text: "Glossary", link: "/reference/glossary" },
				],
			},
			{
				text: "About",
				collapsed: false,
				items: [
					{ text: "Vision", link: "/about/vision" },
					{ text: "Use Cases", link: "/about/use-cases" },
					{ text: "Team", link: "/about/team" },
					{ text: "Roadmap", link: "/about/roadmap" },
				],
			},
			{
				text: "Legal",
				collapsed: false,
				items: [
					{ text: "Imprint", link: "/legal/imprint" },
					{ text: "Privacy", link: "/legal/privacy" },
				],
			},
		],

		socialLinks: [{ icon: "github", link: "https://github.com/mainzcript/ujl" }],

		footer: {
			message:
				'Released under the MIT License. Built by <a href="https://mainzcript.eu" target="_blank" rel="noopener">mainzcript</a>. Growing. Own. IT. | <a href="/legal/imprint">Imprint</a> · <a href="/legal/privacy">Privacy</a>',
			copyright: `© ${new Date().getFullYear()} mainzcript GbR`,
		},

		search: {
			provider: "local",
		},
	},

	mermaid: {
		// Allow <br/> for line breaks in node labels
		securityLevel: "loose",
	},

	mermaidPlugin: {
		class: "mermaid",
	},

	vite: {
		assetsInclude: ["**/*.svg", "**/*.png", "**/*.jpg", "**/*.jpeg"],
		optimizeDeps: {
			include: ["mermaid"],
		},
		resolve: {
			alias: {
				dayjs: "dayjs/",
			},
		},
	},
});
