import { defineConfig } from "vitest/config";
import preact from "@preact/preset-vite";

// Two pages: the workshop (index.html) and the emulator frame (frame.html),
// which runs in a sandboxed iframe apart from the workshop's storage.
export default defineConfig({
  plugins: [preact()],
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
