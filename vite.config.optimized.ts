import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import compression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Enable gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Enable brotli compression for better performance
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
  
  // Build optimizations
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for large libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // UI components chunk
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],
          
          // Supabase chunk
          supabase: ['@supabase/supabase-js'],
          
          // Charts and visualization
          charts: ['recharts'],
          
          // Icons
          icons: ['lucide-react'],
          
          // Form handling
          forms: ['react-hook-form'],
          
          // Utilities
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    
    // Source maps for debugging (disable in production)
    sourcemap: false,
    
    // Target modern browsers for better optimization
    target: 'esnext',
  },
  
  // Development server optimizations
  server: {
    // Enable HMR for faster development
    hmr: true,
  },
  
  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      'recharts',
    ],
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/hooks': resolve(__dirname, './src/hooks'),
    },
  },
  
  // CSS optimizations
  css: {
    // Enable CSS code splitting
    devSourcemap: false,
  },
  
  // Performance optimizations
  esbuild: {
    // Remove unused imports
    treeShaking: true,
    
    // Optimize for production
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
});
