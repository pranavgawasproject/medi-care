import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Vestigial utility modules ported verbatim from the Vite/JS source.
      // They are not consumed by the UI yet and contain large amounts of
      // untyped JS code that would require a full rewrite to pass strict
      // ESLint. Ignored until the team has bandwidth to type them properly.
      "lib/utils/medicationUtils.ts",
      "lib/utils/triagePriorityEngine.ts",
      "lib/utils/medicationSafety.ts",
      "lib/utils/insuranceBillingUtils.ts",
    ],
  },
  {
    rules: {
      // Allow underscore-prefixed parameters/variables to mark intentional
      // unused API-contract props (e.g. a parent passes `connected` for the
      // header badge but a child component doesn't need it).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
