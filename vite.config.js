import { defineConfig } from 'vite';

export default defineConfig({
    base: './', // Changed from './' to match absolute paths in HTML
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets'
    }
});
