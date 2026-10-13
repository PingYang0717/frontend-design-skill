# Issue tracker

Type: local markdown

這個專案的規格與任務都在 repo 裡,不用外部 tracker。讀寫規則:

## 規格(spec)

- 位置:`docs/specs/<feature>.md`,一個功能一份,格式見 `docs/templates/feature-spec.md`
- 行為用 Gherkin scenario 描述,每個 scenario 有編號(`<前綴>-NNN`);測試名稱、任務單、PR 都用這個編號引用
- 規格不是票;要動工先找對應的任務單

## 任務(ticket)

- 位置:`docs/tasks/<ID>-<slug>.md`,一張任務一個檔案,格式見 `docs/templates/task.md`;索引在 `docs/tasks/README.md`
- 一張任務 = 一個可展示的垂直切片(tracer bullet),範圍是規格裡的一段 scenario
- 「前置任務」列就是 blocked-by;前置都 `done` 的任務才可以開工
- 狀態寫在任務單表格的「狀態」列,只有這四種:

| 狀態              | 意思                                      | 誰改                             |
| ----------------- | ----------------------------------------- | -------------------------------- |
| `ready-for-agent` | 可以開工                                  | 開票的人                         |
| `in-progress`     | 進行中                                    | 開工的 agent,開工第一件事        |
| `needs-human`     | 卡在需要人決定的問題,問題寫在「待確認」節 | agent                            |
| `done`            | PR 已合併                                 | 合併的人,或 agent 在回報裡請人改 |

- 改狀態時同步 `docs/tasks/README.md` 的那一列
- 開工流程:從最新的 `main` 開任務單寫的分支(`<type>/<ID>-<slug>`)→ 狀態改 `in-progress` → 依任務單實作 →
  四項檢查全綠 → commit(Conventional Commits,footer 寫 `Refs: <ID>`)→ 回報。PR 流程見 `docs/conventions/git-workflow.md`
- 新開任務:複製 `docs/templates/task.md`,編號接該前綴的下一號,加進 README 索引

## 沒有的東西

- 沒有 triage 流程:任務單建立時就是 `ready-for-agent`
- 沒有 PR 當請求介面:PR 只用來合併,討論回到任務單的「待確認」
