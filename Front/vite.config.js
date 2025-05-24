import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3042,
    host: '0.0.0.0',
    allowedHosts: ['transcendence.fazai.dev']
  }
});