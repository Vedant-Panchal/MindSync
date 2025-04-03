import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import path from 'path'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), tailwindcss(), svgr({
      svgrOptions: { exportType: "default", ref: true, svgo: false, titleProp: true },
      include: "**/*.svg",
    }),
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    ,],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
