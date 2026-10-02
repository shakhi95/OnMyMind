import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// Project Pages live at https://shakhi95.github.io/OnMyMind/
// so built asset URLs must be prefixed with /OnMyMind/
export default defineConfig({
  base: '/OnMyMind/',
  plugins: [react(), tailwindcss()],
});
