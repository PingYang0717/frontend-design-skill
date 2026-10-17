# 0012. 細粒度權限骨架(模組:permissions):前端守衛只是體驗,真正的檢查在後端

## 背景

> 這份 ADR 只在選了 permissions 模組時存在(ADR-0022)。多數公司內部系統只需要存取閘門
> (公司網路、系統使用權限 → 整頁遮罩,見 ADR-0017),不需要這份。

少數內部系統有「誰能看哪一頁、誰能按哪一顆鈕」的需求。若每個功能各自判斷——在元件裡讀
`user.role === 'admin'`、在路由表手寫條件、選單另外維護一份可見清單——同一個權限會散在
三四處,改一個角色就要找遍全專案,漏掉一處就是「選單看不到、網址卻打得開」或反過來。

另一個常見誤解是把前端守衛當成安全機制。前端的任何判斷都能被使用者繞過(改 JS、直接打
API),它能做的只有「不讓人走進一定會失敗的畫面」。

## 決策

**1. 權限代碼只有一個來源:`src/constants/permissions.ts`。** 值與後端回傳的字串逐字一致
(`'items:read'`),`Permission` 型別由它推導。前端判斷的是**權限**,不是角色:角色到權限的
對應屬於後端,前端只讀 `api/permissionApi.ts` 的 `getPermissions()` 回傳的清單(公司沒有統一的 API,
路徑與形狀收件時問,記在 ADR-0021 第 3 節;骨架預設 `GET /permissions` 回 `string[]`)。

**2. 判斷只走 `usePermission` / `usePermissionChecker`(`hooks/usePermission.ts`)。**
`undefined` 代表不需要權限,一律為 true。元件不自己讀權限清單。

**3. 三個落點,共用同一份判斷與同一個元件 `<RequirePermission>`:**

| 落點 | 機制                                                                                       |
| ---- | ------------------------------------------------------------------------------------------ |
| 路由 | `<RequirePermission onDenied="redirect">` 包住頁面;沒有權限導向 `ROUTES.forbidden`(403 頁) |
| 選單 | `NavEntry.permission`;`AppShell` 以 `usePermissionChecker` 過濾 `NAV_ENTRIES`              |
| 元件 | `<RequirePermission permission={…}>`(預設 `hide`)包住按鈕、欄位、區塊;可給 `fallback`      |

路由與選單都從 `components/layouts/navEntries.tsx` 長出來(`app/routes.tsx` 讀同一份),
一個入口的權限只寫一次。

**4. 前端守衛只是體驗。** 後端必須在每支 API 檢查權限;前端被繞過時,後端回 403,由
`apiError.ts` 的 `isForbidden` 判讀、錯誤卡顯示「沒有權限」
([ADR-0006](0006-api-errors-judged-in-one-place.md))。

✅

```ts
// src/constants/permissions.ts
export const PERMISSIONS = {
  itemsRead: 'items:read',
  itemsWrite: 'items:write',
} as const;
```

```tsx
// 選單項目
{ key: 'items', path: ROUTES.items, icon: <AppstoreOutlined />, label: '項目管理', permission: PERMISSIONS.itemsRead },
```

```tsx
<RequirePermission permission={PERMISSIONS.itemsWrite}>
  <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
    新增
  </Button>
</RequirePermission>
```

❌

```tsx
const permissions = usePermissions();

return <>{permissions.includes('admin') && <Button>刪除</Button>}</>; // 自己判斷、手打字串、角色當權限
```

```tsx
// 選單另外維護一份可見清單,與路由守衛各說各話
const visibleMenus = isAdmin ? ALL_MENUS : USER_MENUS;
```

新增一個權限:`PERMISSIONS` 加一列 → 選單項目設 `permission` → 寫入按鈕用 `<RequirePermission>` 包住。
規則細節見 [`permissions.md`](../conventions/permissions.md)、[`routing.md`](../conventions/routing.md)。

## 後果

- 改一個權限的影響範圍可以靠搜尋 `PERMISSIONS.xxx` 一次找齊。
- 外殼需要權限清單才能過濾選單,所以 `RootLayout` 包一個 `DataBoundary`;`getPermissions()`
  失敗時整個外殼顯示錯誤卡,這是刻意的——不知道有哪些權限就無法決定能看什麼。
- 骨架只做「有沒有這個權限」;資料層級的權限(只能看自己部門的資料)由後端過濾回傳內容,
  前端不重做。
- 登入與「能不能進系統」是另一份決策([ADR-0017](0017-access-gate.md)):沒登入由公司 SDK 跳轉、
  公司網路外或沒有系統使用權限整頁遮罩;進得來但沒有某頁的權限才會走到這裡的 403。
  閘門若也用 403,與細粒度權限的 403 要靠 `code` 區分(收件時確認)。
- 權限代碼與後端不一致時不會有編譯錯誤,只會「永遠沒有權限」;規格或後端契約要列出
  所有權限代碼,並與後端逐字核對。

### 何時重新討論

- 需要條件式權限(「只能編輯自己建立的項目」)時,擴充 `usePermission` 接受資源參數,
  仍保持單一判斷入口。
- 權限在使用期間會變動、需要即時生效時,調整 `permissionsQuery` 的 `staleTime` 或改為推播。
