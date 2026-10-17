# 執行方式:讀多少、誰來做、怎麼派、怎麼驗

`SKILL.md` 說**做什麼**,這份說**怎麼做才快、才省、品質才穩**。給主 agent(orchestrator)讀;子任務不讀這份,
它們只拿第 5 節的 brief。

## 0. 三條原則

1. **讀得少,抄得多。** 骨架的 Item 範例檔(`itemApi.ts`、`useItems.ts`、`ItemTable.tsx`、`ItemsPage.tsx`、`ItemsPage.test.tsx`)
   是最短的規範;規範文件只在範例沒涵蓋時翻,ADR 一律不讀(它解釋「為什麼」,lint 與規範已經擋住該擋的)。
2. **動腦的給決策層,照抄的給雜務層。** 同一個模型從頭做到尾,不是品質最好,只是最貴。
3. **只在兩個點對抗。** 步驟 2 的工作清單出來後、步驟 5 審查時,各找一個「不同家」的模型挑戰;中間每個畫面不做,
   lint / typecheck / test 已經是對抗。

## 1. 什麼時候讀什麼

| 時機              | 只讀這些                                                                                                | 不讀                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 步驟 1 收件       | `SKILL.md`、SPEC 整份、prototype 的 `package.json` / router / theme(React)或 `:root` 與 view 清單(HTML) | 任何 `standards/`、模組 README、ADR                                    |
| 步驟 2 列清單     | `spec-to-code.md`、prototype 逐畫面(只讀該畫面的檔或片段)                                               | 同上                                                                   |
| 步驟 3 疊模組     | 選了的模組 README,一次一份,做完就不再翻;`workflow-detail.md` 步驟 3                                     | 沒選的模組、`standard.md`、ADR 內文                                    |
| 步驟 4 每個畫面   | 子任務只拿 brief 列的東西(第 5 節);主 agent 不讀畫面的程式碼                                            | 其他畫面的檔、`tooling.md`、`git-workflow.md`、`accessibility.md`、ADR |
| 步驟 5 驗證與回報 | `workflow-detail.md` 步驟 5、`docs/api-contract.md`、`check-placeholders` 的輸出                        | 程式碼本身(審查者另開 context 讀)                                      |

規範文件裡「原因」段落是寫給人看的;agent 只讀「規則」與 ✅ / ❌ 範例。`docs/conventions/README.md` 第一行有同樣的提醒。

## 2. 三層模型與公司對應

skill 只寫三層,不寫死模型名;公司現有模型的對應在這張表,換代時只改這裡:

| 層     | 做什麼                                                | 公司目前   | 思考深度(effort) |
| ------ | ----------------------------------------------------- | ---------- | ---------------- |
| 決策層 | 收件問答、列工作清單、填共用檔、審查、回報            | Opus 5.5   | 高               |
| 挑戰層 | 步驟 2 後與步驟 5 的對抗性驗證;**一定是不同家的模型** | GPT-5      | 高               |
| 實作層 | 每個畫面的 DTO → endpoint → hook → 元件 → 頁面        | Sonnet 5.5 | 中               |
| 雜務層 | 疊模組、填色票、測試檔、修 lint / typecheck 紅字      | Sonnet 5   | 低               |

effort 的規則:**題目有沒有需要權衡的成分**。有 → 高;沒有 → 低。兩個反直覺的點:修紅字用高 effort 會「順便重構」,
是最浪費的一種;做畫面拉高 effort 省不了 bug,bug 多半來自 SPEC 沒寫清楚,那是步驟 1、2 的事。
工具不給調 effort 時,brief 第一行的「思考深度」那句話本身就有壓制效果。

## 3. 五個角色

| 角色             | 層             | 一句話職責                                                          | 範本                                 |
| ---------------- | -------------- | ------------------------------------------------------------------- | ------------------------------------ |
| `orchestrator`   | 決策層         | 跑五步、問問題、填共用檔、派工、收回報、跑四項檢查;**不自己寫畫面** | 就是讀這份的主 agent                 |
| `screen-builder` | 實作層         | 做一個畫面(分層順序),只拿 brief 列的檔,做完跑該畫面的檢查           | `templates/agents/screen-builder.md` |
| `lint-fixer`     | 雜務層         | 只給錯誤訊息與該檔,改到綠,不重構、不質疑規範                        | `templates/agents/lint-fixer.md`     |
| `challenger`     | 挑戰層         | 乾淨 context;給 SPEC + prototype 清單 + 工作清單,只回固定五題       | `templates/agents/challenger.md`     |
| `reviewer`       | 決策層或挑戰層 | 乾淨 context;對照 SPEC、契約表、回報草稿,找漏做與偏離               | `templates/agents/reviewer.md`       |

角色範本在步驟 3 複製到專案 `docs/agents/`(與 `AGENTS.md` 並列),之後加畫面的人直接用。

## 4. 平行:步驟 4 怎麼切

畫面之間只共用三個檔:`constants/routes.ts`、`components/layouts/navEntries.tsx`(+ `app/navPages.tsx`)、
(i18n)`i18n/zhTW.ts` 與 `en.ts`;選了 msw 還有 `mocks/handlers.ts`、`mocks/db.ts` 的註冊點。

1. **主 agent 先一次填好共用檔**:所有畫面的路由、選單入口、`NAV_PAGES` 對照(頁面檔先放最小殼)、字典的 `nav.*` 與
   `pages.<name>.title`、msw 的空 handler 註冊位置。跑 typecheck 確認殼是綠的,commit 一次。
2. **把每個畫面派給一個 `screen-builder`**,brief 依第 5 節;同時派(swarm),**每個子任務只能改自己畫面的檔與字典裡
   自己的區塊**(`items: { … }`),共用檔只准新增自己那一行,不准動別人的。
3. 子任務回報後,主 agent 只做三件事:看回報的「偏離 / 待確認」、跑 `npm run lint:fix` 排 import、跑四項檢查。
   紅字交給 `lint-fixer`,不自己修。
4. 全部畫面完成後移除 Item 範例(`workflow-detail.md` 步驟 4 末),這步主 agent 自己做(跨檔刪除,不適合派)。

畫面之間有依賴(詳細頁要列表頁的 DTO)時,DTO 與 endpoint 由主 agent在第 1 步一起填,元件與頁面仍可平行。

## 5. 派工 brief(固定 15 行,填空)

```
角色:screen-builder(docs/agents/screen-builder.md)
思考深度:中——有範例可抄,DTO 對映與驗證規則要判斷;不重構既有檔、不質疑規範。
畫面:<畫面名稱>(路由 <path>,選單 key <key>)
需求:docs/spec/<檔>.md 第 <n> 節(只讀這一節)
視覺:docs/prototype/<版本>/<該畫面的檔或片段>
契約:docs/api-contract.md 的 <端點清單>;沒有的端點依 SPEC 提草案,DTO 註解標「草案」
照抄的範例:src/types/api/item.ts、src/api/itemApi.ts、src/hooks/useItems.ts、src/hooks/useItemMutations.ts、
  src/components/items/ItemTable.tsx、src/components/items/ItemCreateDialog.tsx、src/pages/Items/ItemsPage.tsx、
  src/pages/Items/ItemsPage.test.tsx(選了模組時這些檔已是模組版)
只讀這些規範:docs/conventions/api.md 第 3、4、7 節;碰到表格 / 表單再讀 ag-grid.md 第 4 節 / react-hook-form.md 第 3 節
要產出(依序):types/api/<資源>.ts → api/<資源>Api.ts(含 JSDoc)→ (msw)handlers + db → hooks/use<資源>.ts、
  use<資源>Mutations.ts → components/<domain>/ → pages/<Name>/<Name>Page.tsx → 字典 <name> 區塊 → <Name>Page.test.tsx
不准動:其他畫面的檔;routes.ts、navEntries.tsx、navPages.tsx 已填好;共用檔只新增自己那一行
做完跑:npx eslint <你改的檔>、npx tsc -b、npx vitest run src/pages/<Name>;紅字自己修到綠,修不掉就回報
回報格式:完成的檔案清單;偏離 prototype / SPEC 的地方與原因;待確認(DTO 草案、找不到的圖示);沒做的部分
```

brief 固定,子任務拿到的東西就固定,context 不會越滾越大。`lint-fixer` 的 brief 更短:錯誤訊息全文 + 該檔路徑 +
「思考深度:低——照錯誤訊息改,不重構、不改規範、不動其他檔」。

## 6. 對抗性驗證(兩次)

**步驟 2 之後、寫任何程式碼之前**:派 `challenger`(挑戰層,乾淨 context),給它 SPEC、prototype 畫面清單、工作清單,只問固定五題:

1. SPEC 有、工作清單沒有的畫面或端點
2. 權限矩陣(選了 permissions)或角色描述有沒有矛盾
3. SPEC 與 prototype 哪裡不一致(欄位、流程、狀態)
4. 閘門狀態碼與一般錯誤有沒有重疊、code 有沒有講清楚
5. DTO 草案哪些欄位型別是猜的

它回來的每一條,主 agent 要寫「採納 / 不採納 + 一句理由」,進回報的「暫定決定」或「待確認」。採納的改工作清單再派工。

**步驟 5**:派 `reviewer`(乾淨 context),給它 SPEC、`docs/api-contract.md`、回報草稿、`git diff --stat`;要它找「SPEC 有但程式沒做」
「契約表的端點 SPEC 沒提」「回報沒列的偏離」。同樣逐條採納 / 不採納。

一次挑戰的成本約一個畫面的三分之一;步驟 2 漏一個畫面,補的代價遠大於此。

## 7. 驗證的節奏

| 什麼時候               | 跑什麼                                                               |
| ---------------------- | -------------------------------------------------------------------- |
| 改完一個檔             | `npx eslint <那個檔>`(不跑整包 lint)                                 |
| 一個畫面做完(子任務內) | `npx tsc -b`、`npx vitest run src/pages/<Name>`                      |
| 主 agent 收回一批      | `npm run lint:fix` → `npm run lint && npm run typecheck && npm test` |
| 全部完成               | 四項 + `npm run api-contract` + `check-placeholders`,只跑一次        |

`npm run build` 只在最後跑一次;AG Grid chunk 的 500 kB 警告是預期。

## 8. 在 Kimi Code 上怎麼對應

| 這份的說法                         | Kimi Code                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| 主 agent                           | 你開的那個對話,模型選決策層                                                          |
| 派 `screen-builder` / `lint-fixer` | 子任務(subagent),模型與 effort 依第 2 節;角色提示詞用 `docs/agents/<角色>.md` 的內容 |
| 同時派多個畫面                     | swarm 模式,一個畫面一個成員,brief 各自獨立;共用檔已由主 agent 填好所以不會衝突       |
| `challenger` / `reviewer`          | 子任務但**不繼承主對話的 context**(乾淨開),模型選挑戰層                              |
| effort                             | 子任務的 effort 設定;設不了就靠 brief 第一行                                         |

Kimi 的設定檔格式與參數名以它的文件為準,這裡不抄;`docs/agents/*.md` 的內容是工具無關的,貼進去或指過去都行。
用其他工具(Claude Code、opencode)時對應方式相同:子任務 + 模型 + effort 三個旋鈕,名字不同而已。
