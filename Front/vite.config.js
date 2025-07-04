import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: process.env.FRONT_PORT,
    host: '0.0.0.0',
    allowedHosts: ['pong.fazai.dev', 'devpong.fazai.dev']
  },
  define: {
    'process.env.BACK_API_BASE_URL': JSON.stringify(process.env.BACK_API_BASE_URL || 'http://localhost:3142')
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
