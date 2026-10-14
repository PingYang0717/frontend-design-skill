# Git 工作流程

## 1. 分支

**規則:** `main` 是唯一的長期分支,永遠可部署。所有改動從 `main` 開短期分支,經 PR 合併回去。
不直接 push 到 `main`(由分支原則擋下)。

分支命名:`<type>/<簡短描述>`,type 與 commit type 相同,描述用英文小寫加連字號;有工作項目編號時
前置編號。

✅ 正確

```
feat/item-create-dialog
fix/ITEM-T03-delete-confirm
docs/update-api-contract
```

❌ 錯誤

```
robert-test
新增項目
feature/ItemCreateDialog_v2_final
```

**原因:** 從分支名就看得出性質與對應任務;短期分支衝突少、review 量小。

- 一個分支只做一件事;分支存活越短越好,超過數天就先把能合併的部分拆出來。
- 合併後刪除分支。

## 2. Commit 訊息:Conventional Commits

**規則:** `<type>(<scope>): <subject>`,由 commitlint(`commitlint.config.js`,
`@commitlint/config-conventional`)在 `commit-msg` hook 強制;格式不對,commit 直接失敗。

```
feat(items): 新增項目建立對話框
```

### type 清單

| type       | 用途                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| `feat`     | 新功能(使用者看得到的行為)                                               |
| `fix`      | 修 bug                                                                   |
| `refactor` | 不改行為的重構                                                           |
| `perf`     | 效能改善                                                                 |
| `style`    | 純格式(空白、分號),不改邏輯;**不是**改 CSS——改畫面樣式用 `feat` 或 `fix` |
| `test`     | 新增或修改測試                                                           |
| `docs`     | 只改文件(`docs/`、`AGENTS.md`、註解)                                     |
| `build`    | 依賴、建置設定(`package.json`、`vite.config.ts`)                         |
| `ci`       | CI 設定(`azure-pipelines.yml`、`.azuredevops/`)                          |
| `chore`    | 其他雜項(lint 設定、`.gitignore`)                                        |
| `revert`   | 還原先前的 commit                                                        |

### scope

- 選填,用**受影響的 domain 或層**,英文小寫:`items`、`auth`、`theme`、`i18n`、`api`、`mocks`、`deps`。
  domain 名稱與 `components/<domain>/` 一致。
- 跨很多 domain 的改動省略 scope,不要硬塞。

### subject

- **用中文**(`subject-case` 已關閉),一句話說清楚「做了什麼」,不加句號。
- 寫結果,不寫過程:✅「修正刪除後清單未更新」 ❌「改了 useItemMutations」。
- 需要說明原因時,空一行寫 body;有對應的規格章節或工作項目時在 body 或 footer 標註。
- 破壞性變更在 type 後加 `!` 並在 footer 寫 `BREAKING CHANGE: …`。

✅ 正確

```
fix(items): 修正刪除後清單未更新

刪除成功後只 invalidate 了詳細資料的 key,清單沒有重新抓取。

Refs: ITEM-T03
```

❌ 錯誤

```
update
Fix bug
feat: 新增對話框。修正表格。調整色票。   ← 一個 commit 混三件事
```

**原因:** 固定格式讓歷史可以依 type 篩選、讓 reviewer 一眼判斷風險;一個 commit 一件事,
出問題時才能單獨 revert。

## 3. PR 流程

1. 從最新的 `main` 開分支,完成改動。
2. 本機跑 `npm run lint && npm run typecheck && npm test && npm run build`,全綠。
3. Push 分支,在 Azure DevOps 開 PR 到 `main`。描述依範本
   `.azuredevops/pull_request_template.md` 填寫(開 PR 時自動帶入)。
4. CI(Build validation)自動跑;失敗就修,不要要求 reviewer 先看。
5. 至少一位 reviewer 核准,且所有討論串已解決。
6. 合併方式:**Squash merge**,合併後的 commit 訊息同樣符合 Conventional Commits
   (通常就是 PR 標題)。合併後刪除來源分支。

PR 標題與 commit 訊息格式相同:`feat(items): 新增項目建立對話框`。

## 4. PR 範本

範本在 `.azuredevops/pull_request_template.md`,每一欄都要填,沒有就寫「無」:

| 欄位       | 填什麼                                                        |
| ---------- | ------------------------------------------------------------- |
| 變更說明   | 做了什麼、為什麼                                              |
| 對應需求   | 規格(`docs/spec/`)的章節或畫面;有 scenario 編號就寫編號       |
| 畫面截圖   | 有改畫面就附淺色、深色各一張                                  |
| 偏離設計稿 | 與 prototype 不同的地方與原因,是否已回報 UX                   |
| 自我檢查   | 逐項勾選(四項檢查、字典、資料抓取寫法、色碼、權限、mock、ADR) |

自我檢查項目對應的規範:[i18n.md](./i18n.md)、[data-fetching.md](./data-fetching.md)、
[styling-theme.md](./styling-theme.md)、[auth.md](./auth.md)、[mocking.md](./mocking.md)。
偏離團隊規範的決定要寫 ADR(`docs/adr/`,編號接續現有最大號)。

## 5. 分支原則(Branch policies)

在 Azure DevOps 對 `main` 設定:

| 原則                                  | 設定                                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------------------- |
| Require a minimum number of reviewers | 至少 1 位;不允許核准自己的改動                                                                |
| Check for linked work items           | 依團隊是否使用 Boards 決定                                                                    |
| Check for comment resolution          | 必須                                                                                          |
| Limit merge types                     | 只允許 Squash merge                                                                           |
| Build validation                      | 指向 `azure-pipelines.yml` 這條 pipeline;Policy requirement 設 Required;main 更新時讓結果失效 |

**原因:** Build validation 讓 lint、typecheck、test、build 四項檢查成為合併的硬條件,不依賴
每個人記得在本機跑;「main 更新時失效」確保合併的是與最新 `main` 一起驗證過的結果。

## 6. 其他規則

- 不 commit `dist/`、`coverage/`、`node_modules/`、`.env.local`(已在 `.gitignore`)。
- `package-lock.json` 一定要 commit,與 `package.json` 的變更放在同一個 commit。
- 不 force push 到別人也在用的分支;自己的分支在 review 前整理 commit 可以 force push。
- 不用 `--no-verify` 跳過 hook。
