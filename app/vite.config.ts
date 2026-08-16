import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "node:url";

// The vendored @higgsfield/quanta components import their glyphs from a private
// icons package; redirect to the Material Symbols shim (matching tsconfig paths).
const QUANTA_ICONS_SHIM = fileURLToPath(
  new URL("./src/lib/quanta-material-icons.ts", import.meta.url),
);

export default defineConfig({
  resolve: {
    alias: [{ find: /^@higgsfield-ai\/icons(\/.*)?$/, replacement: QUANTA_ICONS_SHIM }],
  },
  plugins: [
    svgr({
      svgrOptions: {
        icon: true,
        svgProps: { fill: "currentColor" },
        svgoConfig: {
          plugins: [
            { name: "preset-default", params: { overrides: { removeViewBox: false } } },
          ],
        },
      },
    }),
    // TanStack Start plugin must run before React's plugin.
    tanstackStart(),
    // Deployment target: Vercel (Build Output API via nitro).
    nitro({ preset: "vercel" }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
});
