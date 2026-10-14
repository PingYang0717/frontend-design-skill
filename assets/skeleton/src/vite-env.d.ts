/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 前端呼叫 API 的路徑前綴,預設 `/api`。 */
  readonly VITE_API_BASE_URL?: string;
  /** 開發伺服器 proxy 的後端位址。 */
  readonly VITE_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
