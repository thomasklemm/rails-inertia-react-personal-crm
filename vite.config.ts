import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import RubyPlugin from "vite-plugin-ruby"

export default defineConfig({
  ssr: {
    // prebuilds ssr.js so we can drop node_modules from the resulting container
    noExternal: true,
  },
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
    RubyPlugin(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules/")) return

          // vendor-ui: Radix UI primitives + lucide-react icons (shadcn/ui deps).
          // Grouped for independent cache invalidation — UI components change
          // more often than the React runtime but less often than app code.
          if (
            id.includes("node_modules/@radix-ui/") ||
            id.includes("node_modules/lucide-react/") ||
            id.includes("node_modules/radix-ui/")
          ) {
            return "vendor-ui"
          }

          // vendor-misc: pure utility packages that have zero React dependency
          // in their transitive closure. Including all transitive deps here
          // prevents Rollup's "Circular chunk" warning, which fires whenever
          // a dep in vendor-misc imports something that Rollup's fallback would
          // assign to vendor-react (creating a cross-chunk import cycle).
          //
          // lodash-es (no deps), tailwind-merge (no deps), clsx (no deps),
          // class-variance-authority → clsx, nanoid (no deps), zod (no deps),
          // axios → follow-redirects / form-data / proxy-from-env / mime-types /
          //         combined-stream / asynckit / mime-db (all non-React),
          // laravel-precognition → axios + lodash-es (already covered above).
          if (
            id.includes("node_modules/lodash-es/") ||
            id.includes("node_modules/tailwind-merge/") ||
            id.includes("node_modules/clsx/") ||
            id.includes("node_modules/class-variance-authority/") ||
            id.includes("node_modules/nanoid/") ||
            id.includes("node_modules/zod/") ||
            id.includes("node_modules/axios/") ||
            id.includes("node_modules/follow-redirects/") ||
            id.includes("node_modules/form-data/") ||
            id.includes("node_modules/proxy-from-env/") ||
            id.includes("node_modules/mime-types/") ||
            id.includes("node_modules/mime-db/") ||
            id.includes("node_modules/combined-stream/") ||
            id.includes("node_modules/asynckit/") ||
            id.includes("node_modules/laravel-precognition/")
          ) {
            return "vendor-misc"
          }

          // vendor-react: React runtime + Inertia + all other node_modules.
          // Everything not explicitly assigned above falls into this chunk.
          // This avoids circular cross-chunk references because no package
          // in vendor-misc imports from packages assigned here.
          return "vendor-react"
        },
      },
    },
  },
})
