# 模組:msw(MSW 假後端)

`src/mocks/` 是 MSW 假後端:`npm run dev:mock` 只攔截後端尚未上線的端點(`pendingHandlers`),
測試用同一份 handler(加上已上線的 `shippedHandlers`)當假後端;正式建置不含 mock。
沒選這個模組時,基底沒有 `dev:mock`,頁面測試以 `vi.mock('@/api/<資源>Api')` 換掉 API 模組,
假資料在 `src/test/fixtures.ts`。

套用順序第 3 個(在 i18n、dark-mode 之後)。

## 1. 安裝套件

```bash
npm install -D msw@^3.0.3
npm pkg set scripts.dev:mock="vite --mode mock"
```

## 2. 複製檔案

```bash
cp -R <skill>/assets/modules/msw/files/. <project>/
# 有選 i18n 時再疊:
cp -R <skill>/assets/modules/msw/files.with-i18n/. <project>/
rm <project>/src/test/fixtures.ts   # 假資料改在 src/mocks/db.ts
```

`files/` 的內容:

| 檔案                | 說明                                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/mocks/`        | 新增:`handlers.ts`(pending / shipped)、`db.ts`(種子資料)、`browser.ts`、`server.ts`                                                                |
| `.env.mock`         | 新增:`dev:mock` 用,`VITE_ENABLE_MOCKS=true`                                                                                                        |
| `src/main.tsx`      | **覆蓋**基底:`VITE_ENABLE_MOCKS=true` 時先啟動 MSW worker                                                                                          |
| `eslint.config.js`  | **覆蓋**基底:多一條 `NO_MOCKS`(正式程式碼不得 import `@/mocks/*`)                                                                                  |
| `tsconfig.app.json` | **覆蓋**基底:`exclude` 多 `src/mocks`                                                                                                              |
| `src/test/setup.ts` | **覆蓋**基底:啟動 MSW server,每個測試後 `resetDb()`                                                                                                |
| 3 支測試            | **覆蓋**基底:`HomePage`、`ItemsPage`、`AccessMask`,改用 `server.use(...)` 與 `db`(遮罩測試以 `server.use` 回閘門的狀態碼,請求真的經過 interceptor) |

`files.with-i18n/` 是同一組 `setup.ts` 與 3 支測試的字典版(斷言引用字典、每個測試後語言還原)。

## 3. 修改既有檔案

**`vite.config.ts`**:

1. 第一行加 `import { msw } from 'msw/vite';`
2. `export default defineConfig(({ mode }) => {` 改成 `export default defineConfig(({ command, mode }) => {`
3. `plugins` 陣列裡 `babel(...)` 那行的下面加

   ```ts
   // 只在開發伺服器提供 MSW 的 worker 腳本;build 不載入這個 plugin,正式產物因此不含 mock(ADR-0011)。
   command === 'serve' ? msw({ mode: 'worker-only' }) : null,
   ```

**`.env.example`**:檔尾加

```bash

# 設成 true 時,開發伺服器啟用 MSW 假後端。正式建置一律忽略此變數。
VITE_ENABLE_MOCKS=false
```

**`src/vite-env.d.ts`**:`VITE_API_BASE_URL` 那條的下面加

```ts
  /** `true` 時開發伺服器啟用 MSW 假後端;正式建置忽略。 */
  readonly VITE_ENABLE_MOCKS?: string;
```

**`.gitignore`**:`!.env.example` 的下一行加 `!.env.mock`。

**`.azuredevops/pull_request_template.md`**:「自我檢查」最後一項的上一行加

```md
- [ ] 新增的 mock handler 與 API 契約一致;後端已上線的端點,handler 已從 `pendingHandlers` 搬到 `shippedHandlers`
```

## 4. 測試

不新增測試檔;6 支既有測試換成打 MSW 的版本。`src/test/responseError.ts` 留著(`apiError.test.ts` 用)。

## 5. 與其他模組的互動

| 模組            | 互動                                            |
| --------------- | ----------------------------------------------- |
| i18n            | 有選:多疊 `files.with-i18n/`;沒選:只疊 `files/` |
| dark-mode       | 無(`ThemeSwitch.test.tsx` 兩種測試方式都能跑)   |
| react-hook-form | 無                                              |
| ag-grid         | 無                                              |

## 6. 規範與 ADR

```bash
cp <skill>/assets/modules/msw/standard.md <project>/docs/conventions/msw.md
cp <skill>/assets/modules/msw/adr.md <project>/docs/adr/0011-dev-mocks-removed-when-endpoint-ships.md
```

## 7. 之後的開發

- 新端點:`handlers.ts` 的 `pendingHandlers` 加 handler、`db.ts` 加 `seedXxx()`;後端上線後搬到 `shippedHandlers`
- 登入與閘門不 mock:登入由公司 SDK 處理;要在 `dev:mock` 看遮罩,臨時在 `pendingHandlers` 加一個回閘門狀態碼的 handler,看完刪掉
- 移除 Item 範例時,`handlers.ts` 的 items handler 與 `db.ts` 的 `seedItems` 一起刪
- 細則見 `docs/conventions/msw.md`
