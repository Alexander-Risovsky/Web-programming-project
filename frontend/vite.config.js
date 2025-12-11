import { defineConfig } from "vite";

// Настройка прокси, чтобы обходить CORS в dev-режиме.
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
