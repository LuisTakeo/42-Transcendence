import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: process.env.FRONT_PORT,
    host: '0.0.0.0',
    allowedHosts: ['pong.fazai.dev', 'devpong.fazai.dev']
  }
});