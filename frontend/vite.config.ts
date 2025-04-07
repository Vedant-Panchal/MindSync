import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import path from 'path'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    react(), tailwindcss(), svgr({
      svgrOptions: {
        dimensions: false,
        svgProps: {
          className: '{props.className}', // Pass Tailwind classes through
        },
      }
    })
    ,
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    ,],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
})
