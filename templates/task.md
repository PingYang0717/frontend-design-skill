# {{TASK_ID}}:{{TASK_TITLE}}

> 派給 coding agent 的任務單。一張任務 = 一個可以展示的垂直切片(從 API 到畫面),不要按「元件 / API」水平切。
> 狀態只有這一行是真的;開工改 `in-progress`,完成改 `done`,需要人決定改 `needs-human`(並在「待確認」寫問題)。

| 項目     | 內容                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| 狀態     | ready-for-agent                                                                                                     |
| 規格     | <!-- FILL: docs/specs/<feature>.md 的 scenario 範圍,例如 ITEM-001 ~ ITEM-004 -->                                    |
| 參考畫面 | <!-- FILL: docs/prototype/screens/<screen>.png(淺色;有深色再加 <screen>-dark.png),以及 prototype 版本與畫面名稱 --> |
| 前置任務 | <!-- FILL: 需要先完成的任務編號;沒有寫「無」 -->                                                                    |
| 後端狀態 | <!-- FILL: 已上線 / 開發中(用 mock)/ 未開始(用 mock),依 docs/api/api-checklist.md -->                               |
| 分支     | <!-- FILL: <type>/<ID>-<slug>,例如 feat/ORD-T01-order-list -->                                                      |

## 要做的事

<!-- FILL: 依「加一個新功能」的順序列出(見 docs/conventions/project-structure.md):
     types/api → api/ → mocks(pendingHandlers)→ hooks/ → components/<domain>/ → pages/ → navEntries / navPages / routes → i18n → 測試。
     每一步寫出檔案路徑。 -->

## 可用的既有元件與 hook

<!-- FILL: 列出這個任務應該重用的東西,例如 DataBoundary、IconButton、useConfirmDestructive、useActionMutation、<Can>,以及同 domain 已存在的元件。 -->

## 測試 seam

- 頁面行為:`renderApp('/路徑')` 從網址進入、打 MSW 假後端,斷言畫面文字(引用字典);不 mock hook
- 純函式(`utils/`、`api/apiError.ts`):直接單元測試
- 每個 scenario 一個 `it`,名稱帶 scenario 編號

## 不准做

- 新增套件、新增全域 Zustand store(除非本任務明確要求)
- 寫死色碼或文字;inline style(除非是動態計算的數值)
- 修改 `components/common/` 的既有 props 介面、`docs/conventions/`、`docs/adr/0001–0016`

<!-- FILL: 本任務特有的禁止事項;沒有就刪除這行。 -->

## 驗收條件

- [ ] 規格範圍內每個 scenario 都有測試,測試名稱帶 scenario 編號,全部通過
- [ ] `npm run lint`、`npm run typecheck`、`npm test`、`npm run build` 全部通過
- [ ] 畫面與「參考畫面」一致;不一致處已寫入規格的「偏離紀錄」
- [ ] 回報附上:改動檔案清單、驗證結果、畫面截圖(淺色 / 深色)
- [ ] 本檔「狀態」已改為 `done`,`docs/tasks/README.md` 同步

## 待確認

<!-- FILL: 開工時就知道要人決定的事;沒有就寫「無」。實作中新出現的問題也加在這裡並把狀態改 needs-human。 -->
