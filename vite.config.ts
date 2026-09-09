import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "apple-touch-icon-180x180.png",
        "logo-gif.gif",
      ],
      manifest: {
        name: "VerTwo Finance | ورتو فایننس",
        short_name: "VerTwo",
        description: "مدیریت هوشمند دخل‌وخرج، اقساط و سرمایه‌گذاری طلا",
        lang: "fa",
        dir: "rtl",
        theme_color: "#0b0d10",
        background_color: "#0b0d10",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/logo-gif.gif",
            sizes: "540x720",
            form_factor: "narrow",
            type: "image/gif",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,gif,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 10, maxAgeSeconds: 31536000 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom", "zustand"],
          "supabase-vendor": ["@supabase/supabase-js"],
          "charts-vendor": ["recharts"],
        },
      },
    },
  },
  publicDir: "public",
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
