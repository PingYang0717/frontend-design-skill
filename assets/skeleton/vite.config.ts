import { msw } from 'msw/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// 依「多久變一次」分 chunk:套件只在升級時變,程式碼每次部署都變。分開後,一次發版只讓 index 失效,
// 使用者瀏覽器裡的套件快取保得住。priority 高的群組優先收下同時被多個群組匹配到的模組。
const VENDOR_PATTERN =
  /node_modules[\\/](react|react-dom|scheduler|react-router|axios|@tanstack[\\/][^\\/]+|zustand|@ant-design[\\/]icons(-svg)?)[\\/]/;
const RC_PATTERN = /node_modules[\\/]@rc-component[\\/]/;
const ANTD_PATTERN = /node_modules[\\/](antd|@ant-design[\\/](?!icons)[^\\/]+)[\\/]/;

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, dirname, 'VITE_');
  // 開發伺服器把 /api 轉給本機後端;部署由反向代理處理,與這裡無關。
  const serverOptions = {
    proxy: {
      '/api': { target: env.VITE_PROXY_TARGET || 'http://localhost:8080', changeOrigin: true },
    },
  };

  return {
    plugins: [
      react(),
      // React Compiler 自動處理 memoization,元件不再手寫 useCallback / useMemo(見 docs/conventions/components.md)。
      babel({ presets: [reactCompilerPreset()] }),
      // 只在開發伺服器提供 MSW 的 worker 腳本;build 不載入這個 plugin,正式產物因此不含 mock(ADR-0011)。
      command === 'serve' ? msw({ mode: 'worker-only' }) : null,
    ],
    resolve: {
      alias: { '@': path.resolve(dirname, 'src') },
    },
    server: serverOptions,
    preview: serverOptions,
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              { name: 'vendor', test: VENDOR_PATTERN, priority: 30 },
              { name: 'rc', test: RC_PATTERN, priority: 20 },
              { name: 'antd', test: ANTD_PATTERN, priority: 10 },
            ],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      globals: false,
    },
  };
});
