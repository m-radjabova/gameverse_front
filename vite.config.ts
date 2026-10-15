import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react() , tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@react-three") || id.includes("three-stdlib") || id.includes("/three/")) return "vendor-3d";
          if (id.includes("firebase")) return "vendor-firebase";
          if (id.includes("framer-motion")) return "vendor-motion";
          if (id.includes("react-dom") || id.includes("react-router") || /node_modules\/react\//.test(id)) return "vendor-react";
          if (id.includes("@tanstack/react-query") || id.includes("axios")) return "vendor-data";
          if (id.includes("react-icons")) return "vendor-icons";
        },
      },
    },
  },
})
