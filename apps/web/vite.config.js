import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // host: true listens on all interfaces (IPv4 + IPv6). Without it Vite binds only to
  // ::1, which Firefox can't reach because it resolves localhost to 127.0.0.1 first.
  server: { port: 5173, host: true },
});
