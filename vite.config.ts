import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' lets the production build work from any folder or static host.
export default defineConfig({
  base: './',
  plugins: [react()],
});
