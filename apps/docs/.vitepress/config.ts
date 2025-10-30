import { defineConfig } from "vitepress";
import markdownItTextualUml from "markdown-it-textual-uml";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	srcDir: "src",
	outDir: "dist",

	title: "UJL-Framework",
	description: "Der Open-Source Web-Baukasten der Zukunft - WYSIWYG Web-Builder with JSON Power",
	lang: "de",
	base: "/",
	head: [
		["link", { rel: "icon", href: "/assets/logo-icon.png" }],
		["meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }],
	],

	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		logo: "/assets/logo-icon.png",

		nav: [
			{ text: "Einführung", link: "/01-introduction-and-goals" },
			{ text: "Architektur", link: "/05-building-block-view" },
		],

		sidebar: [
			{ text: "1. Einführung und Ziele", link: "/01-introduction-and-goals" },
			{ text: "2. Randbedingungen", link: "/02-constraints" },
			{ text: "3. Kontext und Abgrenzung", link: "/03-context-and-scope" },
			{ text: "4. Lösungsstrategie", link: "/04-solution-strategy" },
			{ text: "5. Bausteinsicht", link: "/05-building-block-view" },
			{ text: "6. Laufzeitsicht", link: "/06-runtime-view" },
			{ text: "7. Verteilungssicht", link: "/07-deployment-view" },
			{ text: "8. Querschnittliche Konzepte", link: "/08-crosscutting-concepts" },
			{ text: "9. Architekturentscheidungen", link: "/09-architecture-decisions" },
			{ text: "10. Qualitätsanforderungen", link: "/10-quality-requirements" },
			{ text: "11. Risiken und technische Schulden", link: "/11-risks-and-technical-debt" },
			{ text: "12. Glossar", link: "/12-glossary" },
		],

		socialLinks: [{ icon: "gitlab", link: "https://gitlab.rlp.net/ujl-framework" }],

		footer: {
			message: "UJL-Framework - Der JSON basierte WYSIWYG Web-Builder der Zukunft",
			copyright:
				"© 2025 UJL-Framework Team | <a href='https://kleinform.at/imprint/' target='_blank'>Impressum</a> | <a href='https://kleinform.at/privacy-policy/' target='_blank'>Datenschutz</a>",
		},

		search: {
			provider: "local",
		},
	},

	vite: {
		assetsInclude: ["**/*.svg", "**/*.png", "**/*.jpg", "**/*.jpeg"],
	},

	markdown: {
		config: md => {
			md.use(markdownItTextualUml);
		},
	},
});
