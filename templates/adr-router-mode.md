# 0017. 路由模式採用 {{ROUTER_MODE}}

## 背景

React Router 有兩種常用模式:

- **history**(`createBrowserRouter`):網址乾淨(`/items`),但部署端必須把所有路徑 fallback 到
  `index.html`,否則使用者在子路徑按重新整理會得到 404。這個前提寫在伺服器設定裡,不在 repo 裡。
- **hash**(`createHashRouter`):網址帶 `#`(`/#/items`),不需要任何伺服器設定;但凡是離開 app 的連結
  (複製連結、`window.open`、寄出的通知)都要自己補上 `#`,`navigate()` 會補、其他地方不會。

<!-- FILL: 本專案的部署環境(誰維護伺服器、能否設定 fallback、是否部署在子路徑下)與使用者在收件時的回答。 -->

## 決策

採用 **{{ROUTER_MODE}}**。

<!-- FILL: 依選擇寫明具體做法。
     history:src/app/router.tsx 用 createBrowserRouter;部署文件(README 的「部署」)寫明 fallback 設定;部署在子路徑時設定 basename 與 vite 的 base。
     hash:src/app/router.tsx 改用 createHashRouter;新增 utils/appHref.ts 組出帶 # 的完整網址,所有離開 app 的連結一律用它。 -->

## 後果

<!-- FILL: 這個選擇的代價,以及何時重新討論(例如部署環境改變、需要 SEO 或深層連結被外部系統引用)。 -->
