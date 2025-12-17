import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173, // было 80 для прода
    strictPort: true,
    proxy: {
      "/api": {
        //target: "https:hseflow-krutoisashka.amvera.io",
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: true,
      },
      "/media": {
        //target: "https:hseflow-krutoisashka.amvera.io",
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
