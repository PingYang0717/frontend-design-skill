# 團隊開發規範

這個資料夾來自團隊公版,**在專案內不修改**。專案要偏離其中任何一條,寫一份新的 ADR(`docs/adr/` 0017 起)
說明原因;團隊要調整規範,改公版 Skill 並升版,再同步到各專案。

| 文件                                           | 內容                                                |
| ---------------------------------------------- | --------------------------------------------------- |
| [tech-stack.md](./tech-stack.md)               | 核准套件、新增套件流程、版本策略                    |
| [project-structure.md](./project-structure.md) | 各資料夾放什麼、依賴方向、加一個新功能的步驟        |
| [naming.md](./naming.md)                       | 檔案、元件、hook、store、型別、常數、queryKey 命名  |
| [components.md](./components.md)               | 元件寫法、宣告順序、共用元件、何時自製              |
| [state-management.md](./state-management.md)   | 狀態放哪裡的決策樹、Zustand 範本                    |
| [data-fetching.md](./data-fetching.md)         | queryOptions、useSuspenseQuery、mutation 與快取失效 |
| [api.md](./api.md)                             | apiClient、endpoint module、DTO、新增端點           |
| [mocking.md](./mocking.md)                     | 開發期 mock 與測試用 MSW、端點上線的處理            |
| [routing.md](./routing.md)                     | 選單與路由註冊、lazy 頁面、URL 狀態、路由模式       |
| [auth.md](./auth.md)                           | 權限代碼、路由守衛、`<Can>`、選單過濾               |
| [styling-theme.md](./styling-theme.md)         | token、CSS 變數、CSS Modules、圖示                  |
| [typescript.md](./typescript.md)               | strict、any 政策、型別放置、tsconfig                |
| [error-handling.md](./error-handling.md)       | 讀取與寫入錯誤、錯誤文案、新增錯誤 code             |
| [i18n.md](./i18n.md)                           | 文案字典、守門測試                                  |
| [testing.md](./testing.md)                     | 測試寫法、放置、必測項目                            |
| [accessibility.md](./accessibility.md)         | 無障礙基線                                          |
| [tooling.md](./tooling.md)                     | oxlint / ESLint / Prettier 分工、分層規則、CI       |
| [git-workflow.md](./git-workflow.md)           | 分支、commit 格式、PR 流程                          |

文件中標示「骨架的範例功能」的檔案(Item 相關),會在專案第一個真實功能完成後刪除;
寫法以文件裡的程式碼範例為準。
