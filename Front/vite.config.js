import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: process.env.FRONT_PORT,
    host: '0.0.0.0',
    allowedHosts: ['localhost', 'pong.fazai.dev', 'devpong.fazai.dev', '0.0.0.0', 'frontend']
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    optimizeDeps: {
      include: [
        '@babylonjs/core',
        '@babylonjs/gui',
        '@babylonjs/loaders',
        '@babylonjs/materials'
      ]
    }
  }
});
