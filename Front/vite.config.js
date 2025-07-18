import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: process.env.FRONT_PORT,
    host: '0.0.0.0',
    // Configuração para aceitar requisições de qualquer host, incluindo ngrok
    allowedHosts: [
      'localhost',
      '.localhost',
      '127.0.0.1',
      '0.0.0.0',
      'frontend',
      '.ngrok.io',
      '.ngrok-free.app',
      '.ngrok.app',
      '909f45e01116.ngrok-free.app',  // Host específico atual
      /.*\.ngrok\.io$/,
      /.*\.ngrok-free\.app$/,
      /.*\.ngrok\.app$/,
      'mycustomfrontendinceptionbestteam.loca.lt'
    ]
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
