import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Isto é crítico: Diz ao Vite para expor variáveis que comecem por NEXT_PUBLIC_
  // permitindo que a integração automática do Vercel funcione.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
})