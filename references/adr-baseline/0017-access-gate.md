# 0017. 登入交給公司 SDK,存取閘門整頁遮罩,前端不做 session

## 背景

公司所有內部系統共用同一套登入機制:沒有 cookie 時,公司的前端 SDK 自己跳轉到公司登入畫面,登入後帶 cookie 回來;
各系統不用做登入頁,也沒有「登出」要處理。後端每一支 API 都固定檢查兩件事——使用者是否在公司網路內、是否有這個
系統的使用權限——擋下來時回固定的狀態碼或 code,前端用公司提供的 React 遮罩元件整頁蓋住。

公版 3.x 的骨架假設每個系統自己做登入(登入頁、token、401 清 session)與 `GET /me` 權限清單,與這個實況不合:
每個專案第一件事都是拆掉登入頁,而閘門的判斷散在各畫面。

## 決策

**1. 前端沒有登入:沒有登入頁、沒有 session store、不組 header、不判 401。** `apiClient` 只設 `withCredentials: true`
讓瀏覽器帶 cookie。登入、登出、token 續期全部是公司 SDK 的事,它跳轉時前端不需要知道。

**2. 公司套件只從 `vendor/companyUi.tsx` 進來。** 遮罩元件、(選用時)公司公版外殼、使用者資訊都在這一個檔案 import
並以專案自己的名字匯出;其他檔案只 import `@/vendor/companyUi`。測試一律換成替身 `test/companyUiStub.tsx`。

**3. 閘門只在 `app/accessGate.ts` 判斷。** `ACCESS_GATE_RULES` 一張表寫後端用什麼表示「不在公司網路」「沒有系統權限」
(狀態碼、code 或兩者);`connectAccessGate()` 的 response interceptor 判到就寫 `useAccessStore`,
`components/common/AccessMask.tsx`(掛在 `AppProviders`)用公司的遮罩元件整頁蓋住,不能關閉。
每個專案的表示法不同,所以表的內容是專案決定(ADR-0021),機制是公版。

**4. 狀態碼決定全域動作,code 決定文案。** 閘門看狀態碼(必要時加 code);其餘錯誤照 ADR-0006:讀取 → 窗格錯誤卡、
寫入 → toast,文案依 body 的 `code`。兩者重疊(例如閘門與一般拒絕都用 403)時以 `code` 區分。

**5. 細粒度權限(哪一頁、哪顆鈕)不在基底。** 多數系統進得來就全部能用;需要時選 permissions 模組
(ADR-0012 隨模組進專案)。

✅

```ts
// src/app/accessGate.ts
export const ACCESS_GATE_RULES = [
  { kind: 'outsideNetwork', status: 423 },
  { kind: 'noAppPermission', status: 403 },
];
httpClient.interceptors.response.use(undefined, (error) => {
  const kind = resolveAccessGate(error);
  if (kind) useAccessStore.getState().block(kind);
  throw error;
});
```

❌

```ts
// 畫面裡自己判
if (httpStatus(error) === 423) return <Blocked />;
// 自己保管身分
localStorage.setItem('token', ...);
```

規則細節見 [`access.md`](../conventions/access.md)。

## 後果

- 基底少了登入頁、session store、守衛與登出,每個專案不再有「先拆登入」這一步;測試不用假裝登入。
- 本機開發要能打到後端就要有公司的 cookie:開發環境的 proxy 設定與 SDK 的本機模式寫在專案 README「後端」一節;
  選了 msw 時 `dev:mock` 不經過閘門(假後端不擋)。
- 閘門的狀態碼每案不同,第一版契約表(`docs/api-contract.md`)的共用錯誤列讀 `accessGate.ts` 的表;表填錯,契約表就錯,
  要在步驟 5 的回報裡核對。
- 公司套件的 props 與初始化方式不在公版的掌控;`companyUi.tsx` 是唯一要跟著套件改的檔案。

### 何時重新討論

- 公司登入機制改成前端要自己拿 token(例如 OIDC 直連 IdP)時:加回 session store 與 header 的機制,仍只在一處。
- 出現「被擋後可以重試」「部分功能被擋」這類需求時:遮罩改為可關閉或改成窗格層級,與公司套件一起決定。
