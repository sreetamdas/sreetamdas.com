import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        autoStaticPathsDiscovery: true,
        filter: ({ path }) => {
          if (path.includes("#")) {
            return false;
          }

          if (path.startsWith("/newsletter")) {
            return false;
          }

          if (path.startsWith("/keebs")) {
            return false;
          }

          if (path.startsWith("/foobar")) {
            return false;
          }

          if (path.startsWith("/karma")) {
            return false;
          }

          if (path.startsWith("/rwc")) {
            return false;
          }

          return true;
        },
      },
      pages: [
        { path: "/" },
        { path: "/about" },
        { path: "/blog" },
        { path: "/resume" },
        { path: "/fancy-pants" },
        { path: "/aoc" },
      ],
    }),
    viteReact(),
    tailwindcss(),
  ],
});
