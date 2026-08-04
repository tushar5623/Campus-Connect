import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // allowedHosts ko true kar dein taaki URL change hone par baar-baar error na aaye
    allowedHosts: true, 
    
    // Yeh HMR wali lines nikal dengi Vite ka error
    hmr: {
      clientPort: 443 
    }
  }
})
