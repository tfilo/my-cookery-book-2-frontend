import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { ViteMinifyPlugin } from 'vite-plugin-minify';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        // Makes possible to insert .env into html file in dev mode
        createHtmlPlugin({
            minify: false
        }),
        // Minifiess HTML, JS, CSS
        ViteMinifyPlugin({
            minifyCSS: false
        })
    ],
    build: {
        sourcemap: true
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler',
                silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import']
            }
        }
    },
    server: {
        proxy: {
            // Will proxy request to backend running in docker compose while development
            '/api': {
                target: 'http://localhost:8080/',
                changeOrigin: true
            }
        }
    }
});
