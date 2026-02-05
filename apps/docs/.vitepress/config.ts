import { withMermaid } from "vitepress-plugin-mermaid";

const siteUrl = "https://ujl-framework.org";
const ogImageUrl = `${siteUrl}/og/ujl-og.jpg`;

// https://vitepress.dev/reference/site-config
export default withMermaid({
	srcDir: "src",
	outDir: "dist",

	title: "UJL Framework",
	titleTemplate: ":title | UJL Framework",
	description: "Garantiert markenkonforme und barrierefreie Websites mit KI erstellen",
	lang: "de",
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
	],
	transformPageData(pageData) {
		const head = pageData.frontmatter.head ?? [];
		pageData.frontmatter.head = head;

		const title = pageData.frontmatter.title ?? pageData.title ?? "UJL Framework";
		const description =
			pageData.frontmatter.description ??
			pageData.description ??
			"Garantiert markenkonforme und barrierefreie Websites mit KI erstellen";

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
		// https://vitepress.dev/reference/default-theme-config
		logo: "/assets/logo-icon.png",

		nav: [
			{ text: "Über UJL", link: "/about/01-vision" },
			{ text: "Dokumentation", link: "/docs/01-getting-started" },
			{ text: "Demo", link: "/demo" },
			{ text: "Architektur", link: "/arc42/01-introduction-and-goals" },
		],

		sidebar: [
			{
				text: "Über UJL",
				collapsed: false,
				items: [
					{ text: "Vision & Wertversprechen", link: "/about/01-vision" },
					{ text: "Use Cases", link: "/about/02-use-cases" },
					{ text: "Team", link: "/about/03-team" },
				],
			},
			{
				text: "Dokumentation",
				collapsed: false,
				items: [
					{ text: "Getting Started", link: "/docs/01-getting-started" },
					{ text: "Roadmap", link: "/docs/02-roadmap" },
				],
			},
			{
				text: "Architektur (arc42)",
				collapsed: false,
				items: [
					{ text: "1. Einführung und Ziele", link: "/arc42/01-introduction-and-goals" },
					{ text: "2. Randbedingungen", link: "/arc42/02-constraints" },
					{ text: "3. Kontext und Abgrenzung", link: "/arc42/03-context-and-scope" },
					{ text: "4. Lösungsstrategie", link: "/arc42/04-solution-strategy" },
					{ text: "5. Bausteinsicht", link: "/arc42/05-building-block-view" },
					{ text: "6. Laufzeitsicht", link: "/arc42/06-runtime-view" },
					{ text: "7. Verteilungssicht", link: "/arc42/07-deployment-view" },
					{ text: "8. Querschnittliche Konzepte", link: "/arc42/08-crosscutting-concepts" },
					{ text: "9. Architekturentscheidungen", link: "/arc42/09-architecture-decisions" },
					{ text: "10. Qualitätsanforderungen", link: "/arc42/10-quality-requirements" },
					{
						text: "11. Risiken und technische Schulden",
						link: "/arc42/11-risks-and-technical-debt",
					},
					{ text: "12. Glossar", link: "/arc42/12-glossary" },
				],
			},
			{
				text: "Rechtliches",
				collapsed: false,
				items: [
					{ text: "Impressum", link: "/legal/imprint" },
					{ text: "Datenschutz", link: "/legal/privacy" },
				],
			},
		],

		socialLinks: [{ icon: "gitlab", link: "https://gitlab.mainzcript.eu/ujl-framework/ujl" }],

		footer: {
			message: "UJL Crafter - Der erste Open-Source WYSIWYG Editor ohne Design-Chaos",
			copyright:
				"© 2025 UJL-Framework Team | <a href='/legal/imprint'>Impressum</a> | <a href='/legal/privacy'>Datenschutz</a>",
		},

		search: {
			provider: "local",
		},
	},

	// Plugin configuration: mermaid and mermaidPlugin are optional
	// See https://emersonbottero.github.io/vitepress-plugin-mermaid/guide/getting-started.html
	mermaidPlugin: {
		class: "mermaid",
	},

	vite: {
		publicDir: "public",
		assetsInclude: ["**/*.svg", "**/*.png", "**/*.jpg", "**/*.jpeg"],
		optimizeDeps: {
			include: ["mermaid"],
		},
		resolve: {
			alias: {
				// Required for Mermaid ESM compatibility
				dayjs: "dayjs/",
			},
		},
	},
});
