import { defineConfig } from "vitest/config";
import preact from "@preact/preset-vite";

// Two pages: the workshop (index.html) and the emulator frame (frame.html),
// which runs in a sandboxed iframe apart from the workshop's storage.
export default defineConfig({
  plugins: [preact()],
  // The builder for plugins with code (docker compose up builder).
  server: { proxy: { "/api/v1/workshop/builds": "http://127.0.0.1:8090" } },
  build: {
    rollupOptions: {
      input: { workshop: "index.html", frame: "frame.html" },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "test/**/*.test.ts"],
  },
});
