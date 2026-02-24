import pluginJs from "@eslint/js"
import prettierConfig from "eslint-config-prettier/flat"
import pluginReact from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["app/frontend/**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { ignores: ["app/frontend/routes/*"] },
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  pluginJs.configs.recommended,
  reactHooks.configs.flat.recommended,
  ...tseslint.configs.stylisticTypeChecked,
  ...tseslint.configs.recommendedTypeChecked,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  prettierConfig,
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "react/prop-types": "off",
    },
  },
  {
    files: ["**/*.js", "vite.config.ts"],
    ...tseslint.configs.disableTypeChecked,
  },
]
