import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { resolve } from 'path'

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Base path for GitHub Pages deployment
  // Uses repository name when GITHUB_PAGES env is set, otherwise root
  base: process.env.GITHUB_PAGES ? '/mermaid-editor/' : '/',
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  server: {
    port: 5000,
    host: true,
  },
  preview: {
    port: 5000,
  },
});
