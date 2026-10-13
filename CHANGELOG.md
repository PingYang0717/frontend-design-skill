# CHANGELOG

## 0.1.0(2026-10-13)

第一版。以 erd-cowork-frontend 為底稿萃取,依團隊 13 項決議調整。

- 骨架:React 19 + React Compiler、Vite 8、TypeScript 6 strict、Ant Design 6、React Router 8、
  TanStack Query 5、Zustand 5、Axios、Vitest 5 + Testing Library + MSW 3
- 目錄按「層」分;lint 強制分層(no-restricted-imports)、禁止 `../`、禁止 any、正式程式碼不得依賴 mock
- 讀取 `useSuspenseQuery` + 每窗格 `DataBoundary`;寫入 `useActionMutation`
- 角色權限骨架:`permissions.ts`、`usePermission`、`RequirePermission`、`<Can>`、選單依權限過濾
- 內建 typed i18n 字典與兩支守門測試(noBareLiterals、errorCodeCoverage)
- 開發期 MSW(`npm run dev:mock`),`pendingHandlers` / `shippedHandlers` 分流;正式建置不含 mock
- 路由模式由專案收件時決定(ADR 0017 範本)
- CI:Azure DevOps Pipelines;PR 範本;commitlint(Conventional Commits)
- 版本策略:`^` + lockfile + `npm ci`
- 文件:18 份規範、16 份 ADR、README / AGENTS / ARCHITECTURE / CONTEXT / 規格 / 任務單 / API 契約範本

### 已知限制

- 只用一個參考專案萃取;第二個參考專案提供後應比對修正
- 元件內宣告順序、不寫死色碼、無障礙規則仍靠 review(沒有對應 lint)
- react-hooks / React Compiler 規則為 warning,不會擋 CI

### 試跑修正(兩次無人值守試跑:會議室預約系統,history 與 hash 各一次)

- 步驟順序:空資料夾檢查移到步驟 1;分析檔寫在專案的 `docs/_bootstrap/` 不算既有內容
- 骨架首頁改名 `home`,補「prototype 沒有首頁」的完整清理步驟;新增頁面最小測試範本 `HomePage.test.tsx`
- 不在選單上的頁面改放 `app/subPages.tsx`,避免 `only-export-components` 警告
- lockfile 名稱同步(`npm install --package-lock-only --ignore-scripts`),檢查腳本一併檢查
- 新增 `api-interface-auth.md`(`GET /me`);api-checklist 的 mock 欄加「未建立」
- 收件加問英文名稱與 prototype 的團隊共享位置;外殼差異一律開任務單
- 無人值守:沒有建議答案的問題寫「待確認」照常繼續;完成後做第一次 commit
- 所有 Markdown 先以骨架的 Prettier 設定格式化,commit 時 lint-staged 不會再改寫團隊規範
