import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import copy from 'rollup-plugin-copy'

export default defineConfig({
  plugins: [
    vue(),
    copy({
      verbose: true,
      hook: 'closeBundle',  //不加这个就没法复制，可能是版本问题
      targets: [
        { src: 'src/posts/*', dest: 'dist/src/posts' },
        { src: 'src/pages/*', dest: 'dist/src/pages' }
      ]
    })
  ],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'buffer': 'buffer'
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ]
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    }
  },
  base: '/'
})