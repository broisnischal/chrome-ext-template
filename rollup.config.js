import { autoReload } from "rollup-plugin-auto-reload";

export default {
  input: "src/**/*.tsx",
  output: {
    file: "dist/main.js",
    format: "iife",
  },
  plugins: [autoReload()],
};
