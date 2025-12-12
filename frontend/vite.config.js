import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 80, 
    strictPort: true,
    proxy: {
      "/api": { 
        target: "https:hseflow-krutoisashka.amvera.io",
        changeOrigin: true,
        secure: true,
      },
      "/media": { 
        target: "https:hseflow-krutoisashka.amvera.io",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
