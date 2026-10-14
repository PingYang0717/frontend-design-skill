# 測試

Vitest + Testing Library + MSW。不做 E2E;頁面測試從網址進入、經過真的 Provider 與路由、
打 MSW 假後端,涵蓋使用者看得到的行為。

## 1. 工具與設定

| 項目     | 位置                                          | 說明                                                                                              |
| -------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 測試執行 | `vite.config.ts` 的 `test`                    | `environment: 'jsdom'`、`globals: false`(一律明確 import `describe`/`it`/`expect`)                |
| 全域設定 | `src/test/setup.ts`                           | 啟動 MSW server、接上 session、補 `matchMedia` / `ResizeObserver`、每個測試預設已登入、測試後清理 |
| 假後端   | `src/mocks/handlers.ts`、`db.ts`、`server.ts` | 開發期 mock 與測試共用同一份 handler                                                              |
| 渲染     | `src/test/renderApp.tsx`                      | 以真實 Provider 與路由表渲染整個 app                                                              |
| 斷言     | `@testing-library/jest-dom`                   | `toBeInTheDocument()` 等                                                                          |
| 互動     | `@testing-library/user-event`                 | 點擊、輸入一律用它                                                                                |

表格(`DataGrid`)在測試環境關閉欄位虛擬化,儲存格內容照常以 `findByText` 斷言;AG Grid 自己的排序、篩選不測
(見 [data-grid.md](./data-grid.md) 第 7 節)。表單欄位以 `getByLabelText` 取得(`FormField` 負責 label 關聯,見
[forms.md](./forms.md) 第 6 節)。

`setup.ts` 在每個測試後:`cleanup()` → `server.resetHandlers()` → `resetDb()` →
`localStorage.clear()` → 語言重設為 `zh-TW`;每個測試前把 session 設為已登入(`MOCK_ACCESS_TOKEN`)。
所以測試裡改 `db`、`server.use` 或登出都不會洩漏到下一個測試;要測未登入,在測試裡
`useSessionStore.setState({ accessToken: null })`。

`setup.ts` 以 `configure({ asyncUtilTimeout: 5000 })` 把 `findBy…` / `waitFor` 的預設等待從 1 秒
拉長到 5 秒:頁面是 lazy 載入且先 suspend,AG Grid 又是最大的模組,在慢機器上平行跑時,第一次渲染可能超過 1 秒。
不要在個別測試再傳 `timeout` 蓋掉它;真的超過 5 秒,先找原因。

MSW 以 `onUnhandledFrame: 'error'` 啟動:測試打到沒有 handler 的端點會直接失敗,不會靜靜地發出真的請求。

```bash
npm test            # 跑一次(CI 用這個)
npm run test:watch  # 開發時
```

## 2. 一律用 `renderApp` 從網址進入

**規則:** 頁面與元件的行為測試用 `renderApp('/路徑')`,不自己組 Provider、不 mock hook。

**原因:** 測試與正式畫面走同一條路(同一份 `AppProviders`、同一份 `appRoutes`、同一個
`DataBoundary`),權限守衛、Suspense、錯誤卡都一起被測到。mock 掉 hook 的測試,測的是 mock。

✅ 正確

```ts
renderApp('/items?q=B');
expect(await screen.findByText('範例項目 B')).toBeInTheDocument();
```

❌ 錯誤

```ts
vi.mock('@/hooks/useItems', () => ({ useItems: () => [{ id: '1', name: 'A' }] }));
render(<ItemTable keyword="" />);
```

`renderApp` 回傳 `router`,需要斷言網址時用 `router.state.location.pathname`。

純函式(`utils/`、`api/apiError.ts`)直接單元測試,不需要 render(範本:`src/api/apiError.test.ts`)。

## 3. 放置與命名

**規則:**

- 測試檔與受測檔放在同一個資料夾,命名 `<受測檔名>.test.ts(x)`:
  `src/pages/Items/ItemsPage.test.tsx`、`src/api/apiError.test.ts`。
- 跨檔案的守門測試放在它守的那一層(`src/i18n/noBareLiterals.test.ts`)。
- `describe` 寫受測對象,`it` 寫**行為**(英文、現在式):
  `it('hides write actions from a read-only user')`。
- 測試 helper 放 `src/test/`,同樣用 `const x = () => {}`。

❌ `it('test 1')`、`it('should work')`、`__tests__/` 資料夾。

## 4. 斷言引用字典

**規則:** 比對介面文字一律引用字典(`import { zhTW as t } from '@/i18n/zhTW'`),不寫死文案。
mock 資料(`'範例項目 A'`)不是文案,可以寫死。詳見 [i18n.md](./i18n.md) 第 7 節。

```ts
expect(await screen.findByText(t.errors.loadFailed(t.items.entity))).toBeInTheDocument();
```

## 5. 查詢元素的優先順序

**規則:** 依 Testing Library 建議:`getByRole`(含 `name`)> `getByLabelText` > `getByText`。
不用 `container.querySelector`、class 名稱、`data-testid`(除非真的沒有可存取的名稱——那通常
代表該補無障礙名稱,見 [accessibility.md](./accessibility.md))。

- 等待非同步出現用 `findBy…`;斷言**不存在**用 `queryBy…`。
- 對話框內的操作用 `within(dialog)` 限定範圍。

```ts
const dialog = await screen.findByRole('dialog');
await user.type(within(dialog).getByLabelText(t.items.create.nameLabel), '新的項目');
await user.click(within(dialog).getByRole('button', { name: t.common.create }));
```

## 6. 帶圖示的按鈕用部分比對

**規則:** antd 的 `<Button icon={…}>文字</Button>`,無障礙名稱會包含圖示的名稱(例如「plus 新增」),
用正規表示式部分比對;純文字按鈕與 `IconButton`(名稱就是 `label`)用完整字串。

✅ 正確

```ts
screen.getByRole('button', { name: new RegExp(t.common.create) }); // 帶 PlusOutlined
screen.getByRole('button', { name: t.items.delete.label('範例項目 A') }); // IconButton
```

❌ 錯誤

```ts
screen.getByRole('button', { name: t.common.create }); // 帶圖示時找不到
```

## 7. 用 `server.use` 覆寫單一測試的回應

**規則:** 要測錯誤、空清單、特殊資料時,在該測試裡用 `server.use(...)` 覆寫 handler,或直接改
`db`。不另外寫一份 handler 檔。覆寫會在測試結束時由 `setup.ts` 還原。

```ts
server.use(http.get('*/api/items', () => HttpResponse.json({ code: 'BOOM' }, { status: 500 })));
renderApp('/items');
expect(await screen.findByText(t.errors.loadFailed(t.items.entity))).toBeInTheDocument();
```

```ts
db.currentUser = { ...db.currentUser, permissions: ['items:read'] };
```

- 路徑寫 `*/api/...`,與 `handlers.ts` 的 `api()` helper 一致。
- 錯誤回應的 body 依 `ApiErrorBody` 形狀(`{ code, message? }`)。
- 測試環境的 QueryClient 不重試(`src/app/queryClient.ts`),錯誤會立刻呈現。

## 8. 什麼一定要測

每個功能(頁面或對話框)至少涵蓋:

1. **正常顯示**:後端資料出現在畫面上。
2. **主要寫入流程**:例如新增後清單出現新資料(經過 MSW、invalidate、重新抓取)。
3. **讀取失敗**:錯誤卡出現,按重試能恢復。
4. **權限**:沒有權限時入口或按鈕不存在;路由被導到 403。登入、登出與 401 由骨架的測試涵蓋,新功能不用重測。
5. **URL 狀態**:篩選/分頁/tab 放在網址的,從帶參數的網址進入要正確呈現。
6. **新的錯誤 code、新的字典條目**:由兩支守門測試自動涵蓋,不需另寫。

範本:`src/pages/Items/ItemsPage.test.tsx`(1–5 都有)、
`src/components/auth/RequirePermission.test.tsx`(權限)、`src/components/auth/RequireAuth.test.tsx`(登入)。

## 9. 不做的事

- 不寫快照測試(`toMatchSnapshot`):antd 結構一升級就整批失敗,而且沒人真的在讀。
- 不測實作細節(state 值、hook 呼叫次數、CSS class)。
- 不用 `setTimeout` / 固定延遲等待;用 `findBy…` 或 `waitFor`。
- 不直接呼叫真的後端。
- 不關掉平行執行;遇到不穩定的測試先找出共享狀態。
