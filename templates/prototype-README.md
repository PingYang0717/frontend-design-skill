# Prototype 版本紀錄

UI/UX 交付的 prototype 是視覺與互動的權威來源([ADR-0001](../adr/0001-visual-authority-is-the-prototype.md))。
所有討論、規格與任務都指向這裡記錄的某個版本;改版走下方的變更流程,不以口頭的「最新那版」為準。

## 目前版本

| 項目               | 內容                                                 |
| ------------------ | ---------------------------------------------------- |
| 版本               | {{PROTOTYPE_VERSION}}                                |
| 交付日期           | {{PROTOTYPE_DATE}}                                   |
| 檔案(團隊共享位置) | {{PROTOTYPE_LOCATION}}                               |
| UX 窗口            | <!-- FILL: 能拍板 UX 問題的人;不知道寫「待確認」 --> |

「檔案」欄填團隊都打得開的位置(雲端硬碟、文件庫連結),不填本機路徑。單一 HTML 預設不進版控(`.gitignore` 已排除 `docs/prototype/*.html`)。

## 改版流程

1. UX 交付新版 → 在下方「版本紀錄」加一列,寫明改了哪些畫面
2. 重新跑一次 prototype 分析,只看有變動的畫面,更新 `docs/_bootstrap/prototype-analysis.md`
3. 更新受影響的規格(`docs/specs/`)與任務單,scenario 編號不重用
4. 色票有變就更新 `src/theme/tokens.ts`

## 版本紀錄

| 版本                  | 日期               | 變更摘要 |
| --------------------- | ------------------ | -------- |
| {{PROTOTYPE_VERSION}} | {{PROTOTYPE_DATE}} | 初版     |
