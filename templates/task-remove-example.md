# T-999:移除骨架的範例功能(Item)

> 骨架附帶一個完整的範例功能「Item」,示範各層的寫法。**等第一個真實功能的任務完成並合併後**再做這張任務單,
> 在那之前保留它當參考。

| 項目     | 內容                         |
| -------- | ---------------------------- |
| 狀態     | ready-for-agent              |
| 前置任務 | 第一個真實功能的任務單已合併 |
| 規格     | 無(純清理)                   |
| 分支     | chore/T-999-remove-example   |

## 要做的事

1. 刪除檔案:
   - `src/types/api/item.ts`、`src/api/itemApi.ts`
   - `src/hooks/useItems.ts`、`src/hooks/useItemMutations.ts`
   - `src/components/items/`、`src/pages/Items/`
2. `src/components/layouts/navEntries.tsx`:移除 `items` 入口,`NavKey` 移除 `'items'`
3. `src/app/navPages.tsx`:移除 `items`
4. `src/constants/routes.ts`:移除 `items`
5. `src/constants/permissions.ts`:移除 `itemsRead`、`itemsWrite`(若真實功能沒有沿用)
6. `src/i18n/zhTW.ts`、`en.ts`:移除 `items` 區塊與 `nav.items`
7. `src/mocks/handlers.ts`、`src/mocks/db.ts`:移除 items 相關 handler 與資料
8. `src/components/auth/RequirePermission.test.tsx`:改用真實功能的路由與權限

## 驗收條件

- [ ] `npm run lint`、`npm run typecheck`、`npm test`、`npm run build` 全部通過
- [ ] 上列 6 個檔案 / 資料夾都已不存在
- [ ] `grep -ri "item" src` 只剩真實功能的內容
- [ ] 本檔「狀態」已改為 `done`,`docs/tasks/README.md` 同步
