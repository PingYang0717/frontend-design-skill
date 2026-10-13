# API 對接核對表

> 每條端點一列。後端上線時:更新「狀態」→ 把 mock handler 從 `pendingHandlers` 搬到 `shippedHandlers`
> ([ADR-0011](../adr/0011-dev-mocks-removed-when-endpoint-ships.md))→ 用真後端跑一次相關畫面。

| 端點 | 契約文件 | 前端 DTO | mock | 後端狀態 | 真後端驗證 | 備註 |
| ---- | -------- | -------- | ---- | -------- | ---------- | ---- |

<!-- FILL: 依 docs/api/ 的端點逐列填入。後端狀態:未開始 / 開發中 / 已上線。mock:未建立 / pending / shipped(骨架階段除了 `GET /me` 都是「未建立」,由任務單建立)。真後端驗證:未驗證 / 已驗證(日期)。 -->
