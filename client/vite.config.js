import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // your backend port
        changeOrigin: true,
        secure: false
      }
    }
  }
};