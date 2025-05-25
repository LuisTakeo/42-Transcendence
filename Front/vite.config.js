import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: process.env.FRONT_PORT || 3042,
    host: '0.0.0.0',
    allowedHosts: ['transcendence.fazai.dev']
  }
});