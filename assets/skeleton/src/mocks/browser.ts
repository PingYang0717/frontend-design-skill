import { setupWorker } from 'msw/browser';

import { pendingHandlers } from './handlers';

/** 開發期 mock(npm run dev:mock)只攔截後端尚未上線的端點,其餘請求照常打真後端。
 *  worker 腳本由 vite.config.ts 的 msw plugin 在開發伺服器提供。 */
export const worker = setupWorker(...pendingHandlers);
