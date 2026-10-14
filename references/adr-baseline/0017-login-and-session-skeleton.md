# 0017. 登入與 session 骨架:畫面與流程一致,只有認證方式隨專案換

## 背景

每個內部系統都要登入,而每個專案各寫一次就會長出不同的登入頁、不同的 token 存放位置
(localStorage、cookie、某個 context)、不同的 401 處理(有的導回登入頁、有的顯示錯誤卡、
有的什麼都不做)。使用者在系統之間切換時感受到的不一致,大多來自這一層。

另一方面,認證方式確實會隨專案或環境不同:有的打公司的帳密登入服務拿 token,有的走 SSO
跳轉,有的放在 gateway 後面只靠 cookie。這一層不能寫死。

## 決策

**1. 骨架內建完整的登入流程,所有專案原樣使用。** 登入頁(`pages/Login/`)、登入狀態
(`stores/useSessionStore.ts`)、守衛(`components/auth/RequireAuth.tsx`)、header 的使用者選單與
登出(`components/layouts/UserMenu.tsx`)、401 處理(`app/session.ts`)都是團隊公版。

**2. 登入狀態只有一個來源:`useSessionStore`。** 它是 client 端的 session 狀態,不是伺服器資料,
所以放 Zustand 而不是 TanStack Query([ADR-0004](0004-server-state-vs-ui-state.md) 的補充);
使用者資料與權限仍來自 `GET /me`([ADR-0012](0012-role-based-permission-skeleton.md))。

**3. token 的送出與 401 的接收只在 `app/session.ts`。** `connectSession()` 以
`setAuthHeaderProvider` 組 header、以 response interceptor 在 401 時清掉 session;`RequireAuth`
看到沒有 session 就導向登入頁。畫面與 hook 不處理 401。

**4. 認證方式是專案層的決定,寫 ADR(`templates/adr-auth-mode.md`)。** 骨架預設「帳密登入回
Bearer token」;換成 SSO 或 cookie 時,只替換 `api/authApi.ts`、`types/api/auth.ts` 與登入頁的
進入方式,第 2、3 點不變。

**5. 前端守衛只是體驗。** 真正的檢查在後端:每支 API 都要驗 token,無效就回 401。

✅

```ts
// src/app/session.ts
setAuthHeaderProvider(() => {
  const { accessToken } = useSessionStore.getState();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
});
httpClient.interceptors.response.use(undefined, (error) => {
  if (httpStatus(error) === 401) useSessionStore.getState().clearSession();
  throw error;
});
```

```tsx
// src/app/routes.tsx:需要登入的一切都在 RequireAuth 底下
{ element: <RequireAuth><RootLayout /></RequireAuth>, children: [...] }
```

❌

```tsx
// 每個頁面自己檢查
if (!localStorage.getItem('token')) navigate('/login');
```

```ts
// 在資料 hook 裡處理 401
onError: (error) => {
  if (httpStatus(error) === 401) navigate('/login');
};
```

規則細節見 [`login.md`](../conventions/login.md)。

## 後果

- 使用者在任何一個系統看到的登入頁、登出位置、逾時行為都一樣;改一次骨架,所有專案跟著變。
- 專案收件時多一個必答題:認證方式。沒有答案時先用骨架預設,ADR 標「待確認」。
- 假後端只對 `GET /me` 檢查 token,其他端點不檢查;這是為了讓 mock 簡單,不代表真後端可以省略。
- token 預設 persist 到 localStorage;對安全要求較高的系統改 sessionStorage 或改走 cookie,寫 ADR。

### 何時重新討論

- 需要 refresh token、多分頁同步登出、或閒置逾時提醒時,擴充 `app/session.ts`,仍保持單一入口。
- 公司統一改用某個 IdP 時,把對應的 SSO 流程做進骨架成為新預設。
