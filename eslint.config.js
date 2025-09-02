import js from "@eslint/js";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import unusedImportsPlugin from "eslint-plugin-unused-imports";

export default [
    js.configs.recommended,
    prettierConfig,
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            prettier: prettierPlugin,
            "unused-imports": unusedImportsPlugin
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "prettier/prettier": "error",
            "unused-imports/no-unused-imports": "error"
        }
    },
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        plugins: {
            prettier: prettierPlugin
        },
        rules: {
            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "prettier/prettier": "error"
        }
    },
    {
        files: ["**/*.{json,md}"],
        plugins: {
            prettier: prettierPlugin
        },
        rules: {
            "prettier/prettier": "error"
        }
    },
    {
        ignores: ["dist/", "node_modules/"]
    }
];
