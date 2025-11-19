import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }: { mode: string }) => {
  // Charger le fichier .env de manière explicite
  const env = loadEnv(mode, process.cwd(), '');

  return defineConfig({
    plugins: [react()],
    base: env.VITE_ASSETS || '/', // Lecture correcte de la variable
  });
};

