# 0019. 認證方式採用 {{AUTH_MODE}}

## 背景

骨架內建的登入流程([ADR-0017](./0017-login-and-session-skeleton.md))固定了登入頁、`useSessionStore`、
`app/session.ts` 的 401 處理與 `RequireAuth`;只有「怎麼拿到身分」隨專案環境不同:

- **帳密登入回 Bearer token**(骨架預設):前端 `POST` 公司登入服務,拿到 token 後每個請求帶 `Authorization`。
- **SSO 跳轉**(OIDC / SAML):登入頁只有一顆「以公司帳號登入」按鈕導向 IdP,callback 頁讀取 token 後存進 store。
- **Gateway / Cookie**:前端沒有 token;gateway 以 cookie 判斷身分,401 時導向 gateway 的登入網址。

<!-- FILL: 本專案的環境:登入服務是什麼、由誰維護、端點與欄位、token 的有效期與是否有 refresh。使用者在收件時的回答。 -->

## 決策

採用 **{{AUTH_MODE}}**。

<!-- FILL: 依 docs/conventions/login.md 第 6 節寫明改了哪些檔案:
     帳密:types/api/auth.ts 與 api/authApi.ts 的路徑、欄位名;mocks/handlers.ts 同步。
     SSO:LoginPage 的進入方式、新增的 callback 頁與路由、IdP 的設定值放哪裡(環境變數,不含機密)。
     Cookie:app/session.ts 的 401 改導向 gateway;RequireAuth 的判斷依據;登出的做法。 -->

## 後果

<!-- FILL: 這個選擇的代價(例如 token 放 localStorage 的風險、SSO 的本機開發方式、cookie 模式下 dev:mock 怎麼登入),以及何時重新討論。 -->
