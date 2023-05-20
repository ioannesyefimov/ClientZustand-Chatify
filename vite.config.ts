import { defineConfig, loadEnv  } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'


// https://vitejs.dev/config/
export default ({mode}) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd() )};
  return defineConfig({
    plugins: [react(),mkcert() ],
    
    server: {
      host:'192.168.1.102'
    }
})
  
}