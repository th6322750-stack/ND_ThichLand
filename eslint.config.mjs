import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: [".webby/**", "tests/visual/__screenshots__/**"],
  },
];

export default eslintConfig;
