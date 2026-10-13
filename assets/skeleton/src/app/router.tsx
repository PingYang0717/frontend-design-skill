import { createBrowserRouter } from 'react-router';

import { appRoutes } from './routes';

/** 路由模式由專案的 ADR 決定(docs/adr/:路由模式)。
 *  - history(createBrowserRouter):網址乾淨,部署端要把所有路徑 fallback 到 index.html。
 *  - hash(createHashRouter):不需要伺服器設定;離開 app 的連結(複製、開新分頁)要自己補 `#`。 */
export const router = createBrowserRouter(appRoutes);
