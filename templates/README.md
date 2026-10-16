# {{PROJECT_NAME}}

{{PROJECT_ONE_LINER}}

<!-- FILL: 2–3 句說明:給誰用、解決什麼問題、主要有哪些功能。來源:docs/spec/。 -->

---

## 技術棧

React 19 + React Compiler、Vite 8、TypeScript(strict)、Ant Design 6、React Router 8、
TanStack Query 5、Zustand 5、Axios。測試是 Vitest + Testing Library。
<!-- FILL: 依 docs/adr/0022 補一句選用模組,例如「另採用 AG Grid Enterprise(表格)、React Hook Form(表單)、MSW(假後端)、
     typed 字典(繁中 / 英文)與深色模式」;沒選的不寫,五個都沒選就刪除這段註解。 -->

選用理由見 [`docs/conventions/tech-stack.md`](./docs/conventions/tech-stack.md),選了哪些模組見
[ADR-0022](./docs/adr/0022-selected-modules.md)。

## 快速開始

需要 Node 24.22 以上。

```bash
npm install
cp .env.example .env.local   # 依註解填入
npm run dev                  # 打真後端,/api 由開發伺服器轉到 VITE_PROXY_TARGET
```

<!-- FILL: 選了 msw 時在上面的指令區塊加一行
     「npm run dev:mock             # 後端未就緒時:以 MSW 假後端開發,帳密見 src/mocks/db.ts 的 MOCK_LOGIN」,
     並在下表 `npm run dev` 下面加一列「`npm run dev:mock` | 開發伺服器 + MSW 假後端(只攔截後端尚未上線的端點)」;沒選就刪除這段。 -->

開啟 http://localhost:5173

| 指令                        | 用途                                                                 |
| --------------------------- | -------------------------------------------------------------------- |
| `npm install`               | 安裝依賴(本機;CI 用 `npm ci`)                                        |
| `npm run dev`               | 開發伺服器                                                           |
| `npm run build`             | 型別檢查 + 正式建置                                                  |
| `npm run preview`           | 預覽建置結果                                                         |
| `npm run lint` / `lint:fix` | oxlint + ESLint                                                      |
| `npm run typecheck`         | 型別檢查                                                             |
| `npm test` / `test:watch`   | Vitest                                                               |
| `npm run api-contract`      | 從程式碼重產 `docs/api-contract.md`(CI 用 `api-contract:check` 比對) |

Commit 前 husky 會自動跑 lint-staged(lint + Prettier)與 commitlint,不需要手動格式化。

## 環境變數

見 [`.env.example`](./.env.example)。所有前端變數以 `VITE_` 開頭、會被打包進前端,**不可放機密**。

## 畫面與路由

<!-- FILL: 表格列出每個路由:路徑、畫面名稱、需要的權限;必須與 src/constants/routes.ts、src/components/layouts/navEntries.tsx 一致。`/login` 是公版登入頁。 -->

| 路徑     | 畫面 | 權限 |
| -------- | ---- | ---- |
| `/login` | 登入 | 無   |

路由模式:<!-- FILL: history 或 hash,連到 docs/adr/0020-router-mode.md。 -->
認證方式:<!-- FILL: 一句話,連到 docs/adr/0021-auth-mode.md。 -->

## 後端

API 契約以 [`docs/spec/`](./docs/spec/) 的 API 一節或後端文件為準;DTO(`src/types/api/`)與契約逐字一致。
前端實際呼叫的端點、I/O 型別與預期錯誤處理在 [`docs/api-contract.md`](./docs/api-contract.md),由程式碼反向產生,
給後端照著實作;改了端點或 DTO 要 `npm run api-contract` 重產。
<!-- FILL: 選了 msw 時寫「mock(`src/mocks/handlers.ts`)也與契約逐字一致;後端尚未上線的端點在 `pendingHandlers`,
     上線後搬到 `shippedHandlers`。」;沒選就刪除這段。 -->

<!-- FILL: 後端的負責團隊或聯絡窗口、各環境的 API 位址(不含機密)、登入服務。不知道就寫「待確認」。 -->

## 主題與視覺

視覺以 prototype 為準([ADR-0001](./docs/adr/0001-visual-authority-is-the-prototype.md));原檔在
[`docs/prototype/`](./docs/prototype/)。色票唯一來源是 `src/theme/tokens.ts`,逐值取自 prototype。
<!-- FILL: 選了 dark-mode 時寫一句深色色票的來源(prototype 有深色 / 保留骨架預設 / 從淺色推導,見 ADR-0022);沒選就刪除這段。 -->

## 部署

<!-- FILL: 各環境的網址與部署方式。若使用 history 路由,寫明伺服器要把所有路徑 fallback 到 index.html。不知道就寫「待確認」。 -->

## 文件地圖

| 文件                                       | 內容                                 |
| ------------------------------------------ | ------------------------------------ |
| [`AGENTS.md`](./AGENTS.md)                 | coding agent 動工前必讀的規則        |
| [`docs/spec/`](./docs/spec/)               | PM 提供的規格(需求的唯一來源)        |
| [`docs/prototype/`](./docs/prototype/)     | UI/UX 提供的 prototype(視覺驗收標準) |
| [`docs/conventions/`](./docs/conventions/) | 團隊開發規範                         |
| [`docs/adr/`](./docs/adr/)                 | 架構決策紀錄                         |

## 待確認

<!-- FILL: 規格或 prototype 沒說、實作時暫用預設或草案的項目,每條一句話與目前的做法。沒有就寫「無」。 -->

## 聯絡窗口

<!-- FILL: 前端負責人、UI/UX 窗口、PM、後端窗口。不知道就寫「待確認」。 -->
