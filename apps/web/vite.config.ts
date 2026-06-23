import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [
    // Must precede @vitejs/plugin-react.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Dev: proxy /api to the backend so the app + API are same-origin and the
    // HttpOnly auth cookies "just work" (no CORS dance in development).
    proxy: {
      "/api": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
});
