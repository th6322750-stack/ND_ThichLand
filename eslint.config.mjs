import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    // NEXT_DIST_DIR is intentionally varied by Playwright and local QA so
    // multiple Next processes do not fight over one cache. None of those
    // generated bundles are source code and ESLint must ignore all of them.
    ignores: [".webby/**", ".next*/**", "tests/visual/__screenshots__/**"],
  },
];

export default eslintConfig;
