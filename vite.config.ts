import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required by the Figma Make
    // toolchain. Tailwind is also the app's actual styling engine (every
    // component uses its utility classes), so both must stay – do not remove.
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    rollupOptions: {
      output: {
        // Split large, stable vendor libraries into their own long-cacheable
        // chunks so app-code changes don't bust the whole bundle and the React
        // runtime downloads in parallel with the rest.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router'],
          motion: ['motion'],
        },
      },
    },
  },
})
