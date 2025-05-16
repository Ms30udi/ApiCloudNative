import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/ApiCloudNative/', // ← Remplace par le nom de ton repo GitHub
  plugins: [react()],
});
