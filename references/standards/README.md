# 團隊開發規範

這個資料夾來自團隊公版,**在專案內不修改**。專案要偏離其中任何一條,寫一份新的 ADR(`docs/adr/` 0023 起)
說明原因;團隊要調整規範,改公版 Skill 並升版,再同步到各專案。

| 文件                                           | 內容                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| [tech-stack.md](./tech-stack.md)               | 核准套件、新增套件流程、版本策略                                         |
| [project-structure.md](./project-structure.md) | 各資料夾放什麼、依賴方向、加一個新功能的步驟                             |
| [naming.md](./naming.md)                       | 檔案、元件、hook、store、型別、常數、queryKey 命名                       |
| [components.md](./components.md)               | 元件寫法、宣告順序、共用元件、何時自製                                   |
| [ag-grid.md](./ag-grid.md)                     | 資料表格:AG Grid 與公版 `DataGrid`(模組:ag-grid,選用時才有)              |
| [react-hook-form.md](./react-hook-form.md)     | 表單:React Hook Form 與公版 `FormField`(模組:react-hook-form,選用時才有) |
| [state-management.md](./state-management.md)   | 狀態放哪裡的決策樹、Zustand 範本                                         |
| [data-fetching.md](./data-fetching.md)         | queryOptions、useSuspenseQuery、mutation 與快取失效                      |
| [api.md](./api.md)                             | apiClient、endpoint module、DTO、新增端點                                |
| [msw.md](./msw.md)                             | 開發期 mock 與測試用 MSW、端點上線的處理(模組:msw,選用時才有)            |
| [routing.md](./routing.md)                     | 選單與路由註冊、lazy 頁面、URL 狀態、路由模式                            |
| [login.md](./login.md)                         | 登入頁、`useSessionStore`、401 處理、登出、換認證方式                    |
| [auth.md](./auth.md)                           | 權限代碼、路由守衛、`<Can>`、選單過濾                                    |
| [styling-theme.md](./styling-theme.md)         | token、CSS 變數、CSS Modules、圖示                                       |
| [dark-mode.md](./dark-mode.md)                 | 深色模式:兩組 token、主題切換、深色值怎麼填(模組:dark-mode,選用時才有)   |
| [typescript.md](./typescript.md)               | strict、any 政策、型別放置、tsconfig                                     |
| [error-handling.md](./error-handling.md)       | 讀取與寫入錯誤、錯誤文案、新增錯誤 code                                  |
| [i18n.md](./i18n.md)                           | 文案字典、守門測試(模組:i18n,選用時才有)                                 |
| [testing.md](./testing.md)                     | 測試寫法、放置、必測項目                                                 |
| [accessibility.md](./accessibility.md)         | 無障礙基線                                                               |
| [tooling.md](./tooling.md)                     | oxlint / ESLint / Prettier 分工、分層規則、CI                            |
| [git-workflow.md](./git-workflow.md)           | 分支、commit 格式、PR 流程                                               |

可選模組(i18n、dark-mode、msw、react-hook-form、ag-grid)的規範,只有收件時選了該模組才在這裡;
選了哪些見 `docs/adr/0022-selected-modules.md`。

**範例以基底為準。** 其他文件的程式碼範例是沒選任何模組時的寫法(文案寫繁中、表格用 antd `Table`、表單用 antd `Form`、
測試以 `vi.mock` 換掉 API 模組);選了模組時,依該模組的規範替換對應的部分(例如選了 i18n,文字改引用字典)。

文件中標示「骨架的範例功能」的檔案(Item 相關),會在專案第一個真實功能完成後刪除;
寫法以文件裡的程式碼範例為準。
