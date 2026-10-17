# 測試

Vitest + Testing Library。不做 E2E;頁面測試從網址進入、經過真的 Provider 與路由,涵蓋使用者看得到的行為。
假後端有兩種,依 `docs/adr/0022-selected-modules.md`:**沒選 msw** 用 `vi.mock` 換掉 `@/api/*Api` 模組(本檔的寫法);
**選了 msw** 打 MSW 假後端(寫法見 `msw.md` 第 6 節,取代本檔第 7 節)。

## 1. 工具與設定

| 項目     | 位置                          | 說明                                                                                      |
| -------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| 測試執行 | `vite.config.ts` 的 `test`    | `environment: 'jsdom'`、`globals: false`(一律明確 import `describe`/`it`/`expect`)        |
| 全域設定 | `src/test/setup.ts`           | 接上閘門、把公司套件換成 `companyUiStub`、補 `matchMedia` / `ResizeObserver`、測試後清理  |
| 假資料   | `src/test/fixtures.ts`        | 各資源的假資料(`testItems()`;選了 permissions 還有 `TEST_PERMISSIONS`);形狀與契約逐字一致 |
| 錯誤回應 | `src/test/responseError.ts`   | 造一個「後端有回應」的 `AxiosError`(`responseError(500, { code: 'BOOM' })`)               |
| 渲染     | `src/test/renderApp.tsx`      | 以真實 Provider 與路由表渲染整個 app                                                      |
| 斷言     | `@testing-library/jest-dom`   | `toBeInTheDocument()` 等                                                                  |
| 互動     | `@testing-library/user-event` | 點擊、輸入一律用它                                                                        |

`setup.ts` 在每個測試前 `useAccessStore.reset()`(沒有被閘門擋住);每個測試後 `cleanup()` → `vi.resetAllMocks()` →
`localStorage.clear()`(選了 i18n 時再把語言重設為 `zh-TW`)。所以測試裡覆寫的回應、遮罩都不會洩漏到下一個測試。
登入沒有東西可測(公司 SDK 的事);要測遮罩見 `AccessMask.test.tsx`。

`setup.ts` 以 `configure({ asyncUtilTimeout: 5000 })` 把 `findBy…` / `waitFor` 的預設等待從 1 秒
拉長到 5 秒:頁面是 lazy 載入且先 suspend,在慢機器上平行跑時,第一次渲染可能超過 1 秒。
不要在個別測試再傳 `timeout` 蓋掉它;真的超過 5 秒,先找原因。

選了 ag-grid 時,`DataGrid` 在測試環境關閉欄位虛擬化,儲存格內容照常以 `findByText` 斷言(`ag-grid.md`)。
表單欄位不論 antd `Form.Item name` 或 `FormField`,都以 `getByLabelText` 取得。

```bash
npm test            # 跑一次(CI 用這個)
npm run test:watch  # 開發時
```

## 2. 一律用 `renderApp` 從網址進入

**規則:** 頁面與元件的行為測試用 `renderApp('/路徑')`,不自己組 Provider、不 mock hook。

**原因:** 測試與正式畫面走同一條路(同一份 `AppProviders`、同一份 `appRoutes`、同一個
`DataBoundary`),權限守衛、Suspense、錯誤卡都一起被測到。mock 掉 hook 的測試,測的是 mock。
要換掉的只有最底層的 API 模組(或 MSW 的網路層),hook 以上全部是真的。

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
- 跨檔案的守門測試放在它守的那一層(例如 i18n 模組的 `src/i18n/noBareLiterals.test.ts`)。
- `describe` 寫受測對象,`it` 寫**行為**(英文、現在式):
  `it('hides write actions from a read-only user')`。
- 測試 helper 放 `src/test/`,同樣用 `const x = () => {}`。

❌ `it('test 1')`、`it('should work')`、`__tests__/` 資料夾。

## 4. 斷言寫畫面上的字

**規則:** 比對介面文字直接寫繁中(與元件裡的字串相同)。選了 i18n 時改為引用字典
(`import { zhTW as t } from '@/i18n/zhTW'`),不寫死文案(`i18n.md` 第 7 節)。
假資料(`'範例項目 A'`)不是文案,兩種情況都可以寫死。

```ts
expect(await screen.findByText('項目載入失敗')).toBeInTheDocument();
// 選了 i18n:expect(await screen.findByText(t.errors.loadFailed(t.items.entity))).toBeInTheDocument();
```

## 5. 查詢元素的優先順序

**規則:** 依 Testing Library 建議:`getByRole`(含 `name`)> `getByLabelText` > `getByText`。
不用 `container.querySelector`、class 名稱、`data-testid`(除非真的沒有可存取的名稱——那通常
代表該補無障礙名稱,見 [accessibility.md](./accessibility.md))。

- 等待非同步出現用 `findBy…`;斷言**不存在**用 `queryBy…`。
- 對話框內的操作用 `within(dialog)` 限定範圍。

```ts
const dialog = await screen.findByRole('dialog');
await user.type(within(dialog).getByLabelText('名稱'), '新的項目');
await user.click(within(dialog).getByRole('button', { name: '新增' }));
```

## 6. 帶圖示的按鈕用部分比對

**規則:** antd 的 `<Button icon={…}>文字</Button>`,無障礙名稱會包含圖示的名稱(例如「plus 新增」),
用正規表示式部分比對;純文字按鈕與 `IconButton`(名稱就是 `label`)用完整字串。

✅ 正確

```ts
screen.getByRole('button', { name: /新增/ }); // 帶 PlusOutlined
screen.getByRole('button', { name: '刪除 範例項目 A' }); // IconButton
```

❌ 錯誤

```ts
screen.getByRole('button', { name: '新增' }); // 帶圖示時找不到
```

## 7. 用 `vi.mock` 換掉 API 模組(沒選 msw)

**規則:** 頁面測試在檔案頂端 `vi.mock('@/api/<資源>Api')`,在 `beforeEach` 給預設回應;要測錯誤、空清單、
特殊資料時,在該測試裡覆寫。不 mock hook、不 mock `apiClient`、不 mock `@/vendor/companyUi`(`setup.ts` 已統一換成替身)。

```ts
vi.mock('@/api/itemApi');

let items: Item[];
beforeEach(() => {
  items = testItems();
  vi.mocked(listItems).mockImplementation(async () => items); // 新增後重新抓取看得到新資料
});

it('shows an error card with retry when the list fails to load', async () => {
  vi.mocked(listItems).mockRejectedValueOnce(responseError(500, { code: 'BOOM' }));
  renderApp('/items');
  expect(await screen.findByText('項目載入失敗')).toBeInTheDocument();
});
```

```ts
vi.mocked(listItems).mockResolvedValue([]); // 空清單的畫面
```

- 錯誤一律用 `responseError(status, body)`,body 依 `ApiErrorBody` 形狀(`{ code, message? }`),判讀才與正式環境相同。
- 斷言送出的內容:`expect(vi.mocked(createItem)).toHaveBeenCalledWith({ name: '新的項目' }, expect.anything())`
  (TanStack Query 會多傳一個 context 參數)。
- 閘門由 `app/accessGate.ts` 在 `apiClient` 上處理,`vi.mock` 的函式不經過 axios;要測它時讓請求真的走 `httpClient`,
  以 `httpClient.defaults.adapter` 回閘門的狀態碼(範本:`AccessMask.test.tsx`),測完還原 adapter。
- 測試環境的 QueryClient 不重試(`src/app/queryClient.ts`),錯誤會立刻呈現。

## 8. 什麼一定要測

每個功能(頁面或對話框)至少涵蓋:

1. **正常顯示**:後端資料出現在畫面上。
2. **主要寫入流程**:例如新增後清單出現新資料(經過 mutation、invalidate、重新抓取)。
3. **讀取失敗**:錯誤卡出現,按重試能恢復。
4. **權限**(選了 permissions 模組):沒有權限時入口或按鈕不存在;路由被導到 403。閘門與遮罩由骨架的測試涵蓋,新功能不用重測。
5. **URL 狀態**:篩選/分頁/tab 放在網址的,從帶參數的網址進入要正確呈現。
6. **新的錯誤 code**:由型別(`Record<KnownErrorCode, string>`)強制;選了 i18n 時再由兩支守門測試涵蓋,不需另寫。

範本:`src/pages/Items/ItemsPage.test.tsx`(1–5 都有)、
`src/components/common/AccessMask.test.tsx`(閘門);選了 permissions 時 `src/components/auth/RequirePermission.test.tsx`(權限)。

## 9. 不做的事

- 不寫快照測試(`toMatchSnapshot`):antd 結構一升級就整批失敗,而且沒人真的在讀。
- 不測實作細節(state 值、hook 呼叫次數、CSS class)。
- 不用 `setTimeout` / 固定延遲等待;用 `findBy…` 或 `waitFor`。
- 不直接呼叫真的後端。
- 不關掉平行執行;遇到不穩定的測試先找出共享狀態。
