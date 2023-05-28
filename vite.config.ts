import { defineConfig, loadEnv  } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import fs from 'fs'

const ip = process.env.VITE_IP_ADDRESS
// https://vitejs.dev/config/
export default ({mode}) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd() )};
  console.log(`MODE:`,mode)
  return mode==='ipaddress' ? (
    defineConfig({
      plugins: [react(),mkcert()],
      server
      : {
        host:ip ?? '192.168.1.101'
      } 
    })
  ) :(
   defineConfig({
    plugins: [react(),mkcert()],
   
    
   
    })
  )
  
}