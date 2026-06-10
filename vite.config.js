import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build', // Mantém 'build' em vez de 'dist' para compatibilidade com o Dockerfile existente
  }
});
