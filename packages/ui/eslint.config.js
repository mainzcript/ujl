// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format

import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

/**
 * ESLint rule: Enforces .js or .ts extensions on relative imports in TypeScript/JavaScript files
 * for ES Modules compatibility (Approach A: Simple & safe)
 *
 * Only checks relative imports (./ or ../), excludes:
 * - SvelteKit aliases ($app/*, $lib/*, etc.)
 * - Type-only imports/exports
 * - Resource files (CSS, images, JSON, etc.)
 * - Generated type definitions (./$types)
 */
const requireJsExtensionInRelativeImports = {
	meta: {
		type: 'problem',
		fixable: 'code'
	},
	create(context) {
		const sc = context.getSourceCode();

		const isRelative = (s) => typeof s === 'string' && (s.startsWith('./') || s.startsWith('../'));
		const hasJsExt = (s) => /\.(mjs|cjs|js|ts)$/i.test(s);
		const isTypeOnly = (node) => node.importKind === 'type' || node.exportKind === 'type';
		const isResourceLike = (s) =>
			/[?#]/.test(s) ||
			/\.(json|svelte|css|scss|sass|less|pcss|styl|svg|png|jpe?g|gif|webp|avif|ico|bmp|wasm|txt|md)(\?.*)?$/i.test(
				s
			);
		const isTypesHelper = (s) => s === './$types' || s.endsWith('/$types');

		/**
		 * Determines if a node should be checked for missing extension
		 */
		function shouldCheck(node, source) {
			if (!isRelative(source)) return false;
			if (isTypeOnly(node)) return false;
			if (isResourceLike(source)) return false;
			if (isTypesHelper(source)) return false;
			if (hasJsExt(source)) return false;
			return true;
		}

		/**
		 * Creates the fixed import string, preserving the original quote style
		 */
		function fixedLiteral(literalNode, source) {
			const raw = sc.getText(literalNode); // Preserves ' or "
			const quote = raw[0];
			return `${quote}${source}.ts${quote}`;
		}

		/**
		 * Reports a violation and provides an auto-fix
		 */
		function report(literalNode, source) {
			context.report({
				node: literalNode,
				message: "ESM requires file extensions on relative imports. Add '.ts' extension.",
				fix(fixer) {
					return fixer.replaceText(literalNode, fixedLiteral(literalNode, source));
				}
			});
		}

		/**
		 * Checks a node and reports violations if found
		 */
		function check(node) {
			const source = node.source?.value;
			if (shouldCheck(node, source)) {
				report(node.source, source);
			}
		}

		return {
			ImportDeclaration: check,
			ExportNamedDeclaration(node) {
				if (node.source) check(node);
			},
			ExportAllDeclaration: check,
			ImportExpression(node) {
				// Handle dynamic imports: import('./module')
				const lit = node.source;
				if (lit && lit.type === 'Literal' && typeof lit.value === 'string') {
					const fake = { source: lit, importKind: undefined, exportKind: undefined };
					check(fake);
				}
			}
		};
	}
};

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
			parserOptions: {
				tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url))
			}
		},
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off'
		}
	},
	{
		files: [
			'**/*.ts',
			'**/*.tsx',
			'**/*.js',
			'**/*.jsx',
			'**/*.svelte',
			'**/*.svelte.ts',
			'**/*.svelte.js'
		],
		plugins: {
			'require-js-extension': {
				rules: {
					'require-js-extension': requireJsExtensionInRelativeImports
				}
			}
		},
		rules: {
			'require-js-extension/require-js-extension': 'error'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		// Disable SvelteKit-specific navigation rules
		// - UI library components are generic and should work outside of SvelteKit
		// - Route layout uses simple href links for navigation which is acceptable here
		files: [
			'src/lib/components/ui/button/button.svelte',
			'src/lib/components/ui/link/link.svelte',
			'src/routes/+layout.svelte'
		],
		rules: {
			'svelte/no-navigation-without-resolve': 'off'
		}
	}
);
