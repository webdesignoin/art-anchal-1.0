import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Increase warning threshold slightly (our admin bundle is intentionally large)
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          // Code-split vendor libraries, Supabase, and the Admin Console separately
          // so the main bundle is smaller and the heavy Admin Console only loads for admins
          manualChunks: {
            // Core React runtime — cached long-term by browsers
            'vendor-react': ['react', 'react-dom'],
            // Supabase client — isolated so auth updates don't bust app cache
            'vendor-supabase': ['@supabase/supabase-js'],
            // Lucide icons — large icon library split out
            'vendor-icons': ['lucide-react'],
            // Admin Console — only downloaded when is_admin === true
            'admin': [
              './src/components/pages/AdminConsoleView.tsx',
            ],
          },
        },
      },
    },
  };
});
