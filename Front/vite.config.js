import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: process.env.FRONT_PORT || 3043,
    host: '0.0.0.0',
    allowedHosts: ['pong.fazai.dev', 'dev-pong.fazai.dev']
  }
});