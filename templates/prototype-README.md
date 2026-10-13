# Prototype 版本紀錄

UI/UX 交付的 prototype 是視覺與互動的權威來源([ADR-0001](../adr/0001-visual-authority-is-the-prototype.md))。
所有討論、規格與任務都指向這裡記錄的某個版本;改版走下方的變更流程,不以口頭的「最新那版」為準。

## 目前版本

| 項目               | 內容                                                 |
| ------------------ | ---------------------------------------------------- |
| 版本               | {{PROTOTYPE_VERSION}}                                |
| 交付日期           | {{PROTOTYPE_DATE}}                                   |
| 原檔(repo 內)      | `docs/prototype/{{PROTOTYPE_FILE}}`                  |
| 檔案(團隊共享位置) | {{PROTOTYPE_LOCATION}}                               |
| UX 窗口            | <!-- FILL: 能拍板 UX 問題的人;不知道寫「待確認」 --> |

## 這個資料夾

| 路徑                 | 內容                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `{{PROTOTYPE_FILE}}` | prototype 原檔,進版控;是驗收標準,不是要搬進 `src/` 的程式碼                                     |
| `screens.json`       | 每個畫面的進入步驟(給截圖腳本用);畫面 id 與 `docs/_bootstrap/prototype-analysis.md` 第 2 節一致 |
| `screens/<id>.png`   | 每個畫面的截圖(淺色);有深色版再有 `<id>-dark.png`。任務單的「參考畫面」連到這裡                 |

截圖由 Skill 的 `scripts/screenshot-prototype.mjs` 依 `screens.json` 產生;prototype 改版就重跑,不手動截。

## 改版流程

1. UX 交付新版 → 換掉原檔、在下方「版本紀錄」加一列,寫明改了哪些畫面
2. 重新跑一次 prototype 分析,只看有變動的畫面,更新 `docs/_bootstrap/prototype-analysis.md`;`screens.json` 有新畫面就補
3. 重跑截圖腳本,連同原檔一起 commit
4. 更新受影響的規格(`docs/specs/`)與任務單,scenario 編號不重用
5. 色票有變就更新 `src/theme/tokens.ts`

## 版本紀錄

| 版本                  | 日期               | 變更摘要 |
| --------------------- | ------------------ | -------- |
| {{PROTOTYPE_VERSION}} | {{PROTOTYPE_DATE}} | 初版     |
