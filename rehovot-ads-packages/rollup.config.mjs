import typescript from "@rollup/plugin-typescript";

// Rollup keeps the JavaScript entry point small and easy to ship to app projects.
export default {
  input: "src/index.ts",
  external: ["@capacitor/core"],
  output: [
    {
      file: "dist/plugin.js",
      format: "es",
      inlineDynamicImports: true,
      sourcemap: true,
    },
    {
      file: "dist/plugin.cjs.js",
      format: "cjs",
      inlineDynamicImports: true,
      exports: "named",
      sourcemap: true,
    },
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
    }),
  ],
};
