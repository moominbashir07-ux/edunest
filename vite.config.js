import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // Ensures assets are loaded correctly on GitHub Pages
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets'
    }
});
