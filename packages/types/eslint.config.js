// ESLint configuration for @ujl-framework/core
// Modern flat config format for TypeScript projects

import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import globals from "globals";
import { fileURLToPath } from "node:url";
import ts from "typescript-eslint";

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

/**
 * ESLint rule: Enforces .js extensions on relative imports in TypeScript/JavaScript files
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
		type: "problem",
		fixable: "code",
	},
	create(context) {
		const sc = context.getSourceCode();

		const isRelative = s => typeof s === "string" && (s.startsWith("./") || s.startsWith("../"));
		const hasJsExt = s => /\.(mjs|cjs|js)$/i.test(s);
		const isTypeOnly = node => node.importKind === "type" || node.exportKind === "type";
		const isResourceLike = s =>
			/[?#]/.test(s) ||
			/\.(json|svelte|css|scss|sass|less|pcss|styl|svg|png|jpe?g|gif|webp|avif|ico|bmp|wasm|txt|md)(\?.*)?$/i.test(
				s
			);
		const isTypesHelper = s => s === "./$types" || s.endsWith("/$types");

		/**
		 * Determines if a node should be checked for missing .js extension
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
			return `${quote}${source}.js${quote}`;
		}

		/**
		 * Reports a violation and provides an auto-fix
		 */
		function report(literalNode, source) {
			context.report({
				node: literalNode,
				message: "ESM requires file extensions on relative imports. Add '.js' extension.",
				fix(fixer) {
					return fixer.replaceText(literalNode, fixedLiteral(literalNode, source));
				},
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
				if (lit && lit.type === "Literal" && typeof lit.value === "string") {
					const fake = { source: lit, importKind: undefined, exportKind: undefined };
					check(fake);
				}
			},
		};
	},
};

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	prettier,
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.es2022,
			},
			parserOptions: {
				tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
			},
		},
		rules: {
			// TypeScript handles undefined variable checking
			"no-undef": "off",

			// Core-specific rules for better code quality
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/explicit-function-return-type": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-non-null-assertion": "warn",

			// General code quality rules
			"no-console": "warn",
			"prefer-const": "error",
			"no-var": "error",
			"object-shorthand": "error",
			"prefer-template": "error",
		},
	},
	{
		files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
		plugins: {
			"require-js-extension": {
				rules: {
					"require-js-extension": requireJsExtensionInRelativeImports,
				},
			},
		},
		rules: {
			"require-js-extension/require-js-extension": "error",
		},
	},
	{
		files: ["**/*.test.ts", "**/*.spec.ts"],
		rules: {
			// Relaxed rules for test files
			"@typescript-eslint/no-explicit-any": "off",
			"no-console": "off",
		},
	}
);
