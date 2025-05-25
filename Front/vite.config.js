import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: process.env.FRONT_PORT || 3042,
    host: '0.0.0.0',
    allowedHosts: ['transcendence.fazai.dev']
  }
});