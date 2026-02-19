import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import prettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));
const configRoot = fileURLToPath(new URL('.', import.meta.url));

const requireExtensionRule = {
	meta: {
		type: 'problem',
		fixable: 'code',
		schema: [
			{
				type: 'object',
				properties: {
					extension: { type: 'string' },
					allowTs: { type: 'boolean' },
					packageExtensions: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								prefix: { type: 'string' },
								extension: { type: 'string' }
							},
							required: ['prefix', 'extension']
						}
					}
				},
				additionalProperties: false
			}
		]
	},
	create(context) {
		const sc = context.sourceCode;
		const options = context.options?.[0] ?? {};
		const defaultExtension = options.extension ?? 'js';
		const allowTs = options.allowTs ?? defaultExtension === 'ts';
		const packageExtensions = options.packageExtensions ?? [];

		const isRelative = s => typeof s === 'string' && (s.startsWith('./') || s.startsWith('../'));
		const hasExt = (s, allowTsForFile) =>
			allowTsForFile ? /\.(mjs|cjs|js|ts)$/i.test(s) : /\.(mjs|cjs|js)$/i.test(s);
		const isTypeOnly = node => node.importKind === 'type' || node.exportKind === 'type';
		const isResourceLike = s =>
			/[?#]/.test(s) ||
			/\.(json|svelte|css|scss|sass|less|pcss|styl|svg|png|jpe?g|gif|webp|avif|ico|bmp|wasm|txt|md)(\?.*)?$/i.test(
				s
			);
		const isTypesHelper = s => s === './$types' || s.endsWith('/$types');

		function resolveExtension(filePath) {
			if (!filePath || filePath === '<input>') return null;
			const relPath = filePath.startsWith(configRoot)
				? filePath.slice(configRoot.length)
				: filePath;
			const normalized = relPath.replace(/^[\\/]/, '').replace(/\\/g, '/');
			for (const entry of packageExtensions) {
				if (normalized.startsWith(entry.prefix)) return entry.extension;
			}
			return defaultExtension;
		}

		function shouldCheck(node, source, allowTsForFile) {
			if (!isRelative(source)) return false;
			if (isTypeOnly(node)) return false;
			if (isResourceLike(source)) return false;
			if (isTypesHelper(source)) return false;
			if (hasExt(source, allowTsForFile)) return false;
			return true;
		}

		function fixedLiteral(literalNode, source, extension) {
			const raw = sc.getText(literalNode);
			const quote = raw[0];
			return `${quote}${source}.${extension}${quote}`;
		}

		function report(literalNode, source, extension) {
			context.report({
				node: literalNode,
				message: `ESM requires file extensions on relative imports. Add '.${extension}' extension.`,
				fix(fixer) {
					return fixer.replaceText(literalNode, fixedLiteral(literalNode, source, extension));
				}
			});
		}

		function check(node) {
			const source = node.source?.value;
			const extension = resolveExtension(context.filename);
			const allowTsForFile = allowTs || extension === 'ts';
			if (!shouldCheck(node, source, allowTsForFile)) return;
			if (!extension) return;
			report(node.source, source, extension);
		}

		return {
			ImportDeclaration: check,
			ExportNamedDeclaration(node) {
				if (node.source) check(node);
			},
			ExportAllDeclaration: check,
			ImportExpression(node) {
				const lit = node.source;
				if (lit && lit.type === 'Literal' && typeof lit.value === 'string') {
					const fake = { source: lit, importKind: undefined, exportKind: undefined };
					check(fake);
				}
			}
		};
	}
};

const requireExtensionPlugin = {
	rules: {
		'require-extension': requireExtensionRule
	}
};

const svelteConfigFor = relativePath =>
	fileURLToPath(new URL(relativePath, import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...tseslint.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.es2022
			}
		},
		rules: {
			'no-undef': 'off',
			'prefer-const': 'error',
			'no-var': 'error',
			'object-shorthand': 'error',
			'prefer-template': 'error',
			'no-console': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-non-null-assertion': 'warn'
		}
	},
	{
		files: ['**/*.test.ts', '**/*.test.tsx', '**/*.test.js', '**/*.test.jsx'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'no-console': 'off'
		}
	},
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		plugins: {
			'require-extension': requireExtensionPlugin
		},
		rules: {
			'require-extension/require-extension': [
				'error',
				{
					extension: 'js',
					allowTs: false,
					packageExtensions: [
						{ prefix: 'packages/ui/', extension: 'ts' },
						{ prefix: 'packages/crafter/', extension: 'ts' },
						{ prefix: 'packages/adapter-svelte/', extension: 'ts' },
						{ prefix: 'packages/adapter-web/', extension: 'ts' }
					]
				}
			]
		}
	},
	{
		files: ['services/library/**/*.{js,jsx,ts,tsx}'],
		plugins: {
			'@next/next': nextPlugin
		},
		settings: {
			next: {
				rootDir: 'services/library'
			}
		},
		rules: {
			...nextPlugin.configs.recommended.rules,
			...nextPlugin.configs['core-web-vitals'].rules,
			'@next/next/no-html-link-for-pages': ['error', 'services/library/src/app'],
			'@typescript-eslint/ban-ts-comment': 'warn',
			'@typescript-eslint/no-empty-object-type': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					vars: 'all',
					args: 'after-used',
					ignoreRestSiblings: false,
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^(_|ignore)'
				}
			],
			'require-extension/require-extension': 'off'
		}
	},
	{
		// $bindable() rune assignments are managed by the Svelte compiler, not visible to ESLint
		files: ['**/*.svelte'],
		rules: {
			'no-useless-assignment': 'off'
		}
	},
	{
		files: ['packages/ui/**/*.svelte'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: tseslint.parser,
				svelteConfig: svelteConfigFor('./packages/ui/svelte.config.js')
			}
		},
		rules: {
			'prefer-const': 'off',
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		files: ['packages/crafter/**/*.svelte'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: tseslint.parser,
				svelteConfig: svelteConfigFor('./packages/crafter/svelte.config.js')
			}
		},
		rules: {
			'prefer-const': 'off'
		}
	},
	{
		files: ['packages/adapter-svelte/**/*.svelte'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: tseslint.parser,
				svelteConfig: svelteConfigFor('./packages/adapter-svelte/svelte.config.js')
			}
		},
		rules: {
			'prefer-const': 'off'
		}
	},
	{
		files: ['packages/adapter-web/**/*.svelte'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: tseslint.parser,
				svelteConfig: svelteConfigFor('./packages/adapter-web/svelte.config.js')
			}
		},
		rules: {
			'prefer-const': 'off'
		}
	},
	{
		files: ['**/*.svelte.ts'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				projectService: true
			}
		}
	},
	{
		files: ['packages/examples/**/*.{ts,tsx,js,jsx}'],
		rules: {
			'no-console': 'off'
		}
	},
	{
		files: ['packages/ui/**/*.{ts,tsx,js,jsx}', 'packages/crafter/**/*.{ts,tsx,js,jsx}'],
		languageOptions: {
			globals: {
				...globals.browser
			}
		}
	},
	{
		files: [
			'packages/adapter-svelte/**/*.{ts,tsx,js,jsx}',
			'packages/adapter-web/**/*.{ts,tsx,js,jsx}'
		],
		languageOptions: {
			globals: {
				...globals.browser
			}
		}
	},
	// Dev/Demo apps - relaxed rules for development code
	{
		files: ['apps/dev-demo/**/*.{ts,tsx,js,jsx,svelte}'],
		rules: {
			'no-console': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off'
		}
	},
	// Dev folders within packages - relaxed rules
	{
		files: ['**/src/dev/**/*.{ts,tsx,js,jsx,svelte}'],
		rules: {
			'no-console': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off'
		}
	},
	// Demo routes in adapter packages
	{
		files: ['packages/adapter-svelte/src/routes/**/*.{ts,tsx,js,jsx,svelte}'],
		rules: {
			'no-console': 'off'
		}
	},
	// Storybook stories - console statements are common for demos
	{
		files: ['**/*.stories.svelte', '**/*.stories.ts', '**/*.stories.js'],
		rules: {
			'no-console': 'off'
		}
	},
	// Logger utilities - console is the whole point
	{
		files: ['**/utils/logger.{ts,js}', '**/lib/utils/logger.{ts,js}'],
		rules: {
			'no-console': 'off'
		}
	},
	// E2E tests - more relaxed than unit tests
	{
		files: ['**/tests/e2e/**/*.{ts,tsx,js,jsx}', '**/e2e/**/*.{ts,tsx,js,jsx}'],
		rules: {
			'@typescript-eslint/no-non-null-assertion': 'off',
			'no-console': 'off'
		}
	}
);
