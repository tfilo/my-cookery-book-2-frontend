import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import istanbul from 'vite-plugin-istanbul';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    return {
        plugins: [
            react(),
            // Makes possible to insert .env into html file in dev mode
            // Instrumentation of source code for cypress test coverage
            istanbul({
                cypress: true,
                forceBuildInstrument: mode !== 'production', // add instrumentation to all non production builds
                include: ['src/**/*']
            }),
            createHtmlPlugin({
                minify: false
            }),
            // Minifiess HTML, JS, CSS
            ViteMinifyPlugin()
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
            watch: {
                ignored: [
                    '**/.nyc_output/**',
                    '**/cypress/downloads/**',
                    '**/cypress/support/**',
                    '**/cypress/results/**',
                    '**/cypress/screenshots/**',
                    '**/coverage/**'
                ]
            },
            proxy: {
                // Will proxy request to backend running in docker compose while development
                '/api': {
                    target: 'http://localhost:8080/',
                    changeOrigin: true
                }
            }
        }
    };
});
