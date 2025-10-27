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
		files: ["**/*.test.ts", "**/*.spec.ts"],
		rules: {
			// Relaxed rules for test files
			"@typescript-eslint/no-explicit-any": "off",
			"no-console": "off",
		},
	}
);
