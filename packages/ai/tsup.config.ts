import { defineConfig } from "tsup"

export default defineConfig([
  // Main entry point
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: false,
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-dom/client",
      "@react-email-dnd/shared",
    ],
  },
  // Server entry point
  {
    entry: ["src/server/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    minify: false,
    outDir: "dist/server",
    external: [
      "openai",
      "@react-email-dnd/shared",
    ],
  },
])
