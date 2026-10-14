## 變更說明

<!-- 這個 PR 做了什麼、為什麼。 -->

## 對應需求

<!-- 規格(docs/spec/)的哪一節或哪個畫面;有 scenario 編號就寫編號。 -->

## 畫面截圖

<!-- 有改畫面就附截圖(淺色 / 深色各一張);沒有畫面變更寫「無」。 -->

## 偏離設計稿

<!-- 有沒有與 prototype(docs/prototype/)不同的地方?原因是什麼?UX 確認了嗎?沒有寫「無」。 -->

## 自我檢查

- [ ] `npm run lint`、`npm run typecheck`、`npm test`、`npm run build` 全部通過
- [ ] 新增或修改的畫面文案都在 i18n 字典裡
- [ ] 讀取用 `useSuspenseQuery` + `DataBoundary`;寫入用 `useActionMutation`(例外已在註解寫理由)
- [ ] 沒有寫死色碼;樣式只用 theme token
- [ ] 需要權限的入口與按鈕已設定 `permission` / `<Can>`;需要登入的頁面都在 `RequireAuth` 底下
- [ ] 新增的 mock handler 與 API 契約一致;後端已上線的端點,handler 已從 `pendingHandlers` 搬到 `shippedHandlers`
- [ ] 有偏離團隊規範的決定,已寫 ADR
