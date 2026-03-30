import { join } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const sharedSrc = join(__dirname, 'src/shared').replace(/\\/g, '/')

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': sharedSrc
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@shared': sharedSrc
      }
    },
    plugins: [react({ jsxRuntime: 'automatic' })]
  }
})
