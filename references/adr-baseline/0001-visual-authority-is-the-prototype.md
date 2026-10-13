# 0001. 視覺權威是 UI/UX prototype

## 背景

每個專案收件時都會拿到一份 UI/UX prototype(設計稿、可點的原型或打包好的單檔成品)。它通常
用 inline style、寫死的色碼與 mock 資料畫成,圖示多半來自 Ant Design 的官方圖示集(或它在
Iconify 上的鏡像 `ant-design:xxx-outlined`)。

開發時若把 prototype 當「參考」,每個人會各自決定「差不多」的間距、顏色與圖示,畫面在幾張
票之後就跟設計稿分家;又因為 antd 自帶一套預設色與演算法,「不寫顏色」本身也是一種選擇,
而且它選的不是設計稿的值。

## 決策

**1. 樣式、排版、圖示必須符合 prototype——不是參考,是驗收標準。** 包含間距、字級、圓角、
收合與展開等版面行為,以及每一個圖示的選用。

**2. 色票只有一個來源:`src/theme/tokens.ts`,逐值取自 prototype。** light 與 dark 各一組,
同時餵給 antd `ConfigProvider`(`theme/antdTheme.ts`)與 CSS Modules 讀的 `--app-*` 變數
(`theme/cssVars.ts`)。不靠 antd 演算法推導「差不多」的顏色:antd 預設的深色表面
(`#000000` / `#141414` / `#1f1f1f`)多半不是設計稿的值。prototype 的 token 表在收件分析
時整理一次,之後改色只改 `tokens.ts`。prototype 原檔與每個畫面的截圖進版控(`docs/prototype/`),
讓之後在乾淨 context 裡開工的 agent 看得到驗收標準,而不是只看文字描述。

**3. 元件與 CSS 不寫死色碼。** CSS Module 一律寫 `var(--app-color-text)` 這種形式;
`tokens.ts` 沒有的顏色先補 token,再使用。

**4. 圖示只用 `@ant-design/icons`。** prototype 的 `ant-design:menu-fold-outlined` 對應
`MenuFoldOutlined`(去掉前綴、轉成 PascalCase)。**不用 emoji 或文字符號頂替圖示**
(`»`、`⋯`、🌙 / ☀️ 這類):它們的大小、基線與顏色都不跟主題走,螢幕閱讀器也會照字面念出。

**5. 刻意偏離 prototype 要留紀錄。** 偏離寫在該功能規格的「偏離紀錄」,並在 PR 範本
(`.azuredevops/pull_request_template.md`)的「偏離設計稿」一節說明;影響全專案的偏離
(例如整個區域改以別的來源為準)另寫 ADR。

✅

```css
.header {
  background: var(--app-color-bg-container);
  border-bottom: 1px solid var(--app-color-border-secondary);
}
```

```tsx
<IconButton icon={<MenuFoldOutlined />} label={t.nav.toggleSider} onClick={toggle} />
```

❌

```css
.header {
  background: #fff; /* 深色模式不會跟著換 */
}
```

```tsx
<Button onClick={toggle}>»</Button>
```

規則細節見 [`styling-theme.md`](../conventions/styling-theme.md)。

## 後果

- 每張票的驗收除了功能,也要拿 prototype 核對視覺與圖示;這一半沒有工具能自動驗,靠 PR
  截圖(淺色 / 深色各一張)與 review。
- prototype 沒畫的狀態(錯誤卡、空狀態、403、深色模式下的某些表面)由開發者補,補的值仍要
  進 `tokens.ts`,不在元件裡臨時寫。
- prototype 若只給淺色,深色值由專案自訂並在 token 的註解寫理由。
- **寫死色碼目前沒有 lint 擋**,靠 review 與 PR 範本的自我檢查。

### 何時重新討論

- prototype 停止維護、或產品改由另一份設計系統主導時,改寫本 ADR 指向新的權威。
- 某個區域需要整體跟另一個來源(例如上游產品)對齊時,在本 ADR 之後另寫一份例外 ADR,
  寫明例外的邊界,不要只在程式註解裡說。
