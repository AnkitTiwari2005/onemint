import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Tooling scripts use CommonJS — exempt from ESM import rule
    "generate-tools.js",
  ]),
  {
    rules: {
      // Many intentional mount-guard patterns (setMounted, localStorage init)
      // flagged by React Compiler rule — downgrade to warn pending refactor
      "react-compiler/react-compiler": "warn",

      // Downgrade from error: 'any' is used intentionally in adapter/bridge code
      "@typescript-eslint/no-explicit-any": "warn",

      // Already fixed unescaped entities — keep as error for new code
      "react/no-unescaped-entities": "error",
    },
  },
]);

export default eslintConfig;
