import { fileURLToPath } from "node:url";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import tailwind from "eslint-plugin-tailwindcss";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

const eslintConfig = [
  ...nextCoreWebVitals,
  ...tailwind.configs["flat/recommended"],
  {
    settings: {
      tailwindcss: {
        // tailwind.config.ts *replaces* the default spacing scale rather
        // than extending it — an arbitrary value outside that scale (or a
        // plain typo) has repeatedly rendered with silently missing CSS
        // instead of an error. Pointing the plugin at the real config is
        // what lets `no-custom-classname` catch a class the theme can't
        // actually produce, instead of only checking against Tailwind's
        // stock scale — it's how this rule caught `h-11`/`w-11` (only in
        // Tailwind's *default* scale, not this project's) silently
        // rendering as 0×0 across three components on the very first run.
        //
        // Must be absolute: the plugin resolves the `tailwindcss` package
        // itself relative to `path.dirname(config)`, and a relative path
        // here resolved against whatever directory ESLint happened to be
        // invoked from (not the project root), so linting anything outside
        // that directory failed with "Could not resolve tailwindcss".
        config: `${projectRoot}tailwind.config.ts`,
      },
    },
    rules: {
      // Keep only the rule that catches the actual failure mode this was
      // added for — a classname the real, restricted theme can't produce.
      // The rest of flat/recommended is pure style preference (class
      // ordering, `size-*` shorthand suggestions, "this arbitrary value has
      // a named equivalent") — turning all of that on at once would bury
      // the one rule that matters under ~200 unrelated warnings on an
      // established codebase, for no correctness benefit.
      "tailwindcss/classnames-order": "off",
      "tailwindcss/enforces-shorthand": "off",
      "tailwindcss/no-unnecessary-arbitrary-value": "off",
      "tailwindcss/enforces-negative-arbitrary-values": "off",
    },
  },
  {
    // NEXT_DIST_DIR is intentionally varied by Playwright and local QA so
    // multiple Next processes do not fight over one cache. None of those
    // generated bundles are source code and ESLint must ignore all of them.
    ignores: [".webby/**", ".next*/**", "tests/visual/__screenshots__/**"],
  },
];

export default eslintConfig;
