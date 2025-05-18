import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@services': '/src/services',
        '@assets': '/src/assets',
        '@styles': '/src/styles',
        '@utils': '/src/utils',
        '@hooks': '/src/hooks',
        '@context': '/src/context',
        '@pages': '/src/pages'
      }
    },
    css: {
      modules: {
        localsConvention: 'camelCase'
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: !isProd,
      minify: isProd ? 'terser' : false,
      terserOptions: isProd ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      } : undefined,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            styles: ['styled-components'],
            audio: ['howler'],
            animation: ['@react-spring/web'],
          },
        },
      },
      reportCompressedSize: true,
      chunkSizeWarningLimit: 1000,
    },
    server: {
      port: 3000,
      host: true,
      strictPort: true,
      hmr: {
        overlay: true
      }
    }
  }
})
