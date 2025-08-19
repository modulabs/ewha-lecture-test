import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/ewha-lecture-test/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          // React 관련 라이브러리들을 별도 청크로 분리
          'react-vendor': ['react', 'react-dom'],
          // 라우터 관련
          'router': ['react-router-dom'],
          // 마크다운 관련 라이브러리들
          'markdown': ['react-markdown', 'remark-gfm'],
          // 애니메이션 라이브러리
          'animation': ['framer-motion'],
          // 상태 관리
          'store': ['zustand'],
          // 아이콘
          'icons': ['lucide-react']
        }
      }
    },
    // 청크 크기 경고 임계값 조정
    chunkSizeWarningLimit: 600
  }
})
