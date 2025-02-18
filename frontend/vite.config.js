import { defineConfig } from 'vite';

export default defineConfig({
    optimizeDeps: {
        exclude: ['@electric-sql/pglite'], // 防止 Vite 预构建 pglite
    },
    worker: {
        format: 'es', // 让 Web Worker 兼容 ESM
    },
    assetsInclude: ['**/*.wasm'], // 让 Vite 识别 WASM 文件
});
