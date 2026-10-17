# 0022. 選用模組

## 背景

團隊骨架分成**必選的基底**與**六個可選模組**。基底(存取閘門與整頁遮罩、色票、`DataBoundary`、錯誤處理、路由、
Zustand、TanStack Query、Vitest、husky + commitlint、Azure DevOps CI)每個專案都一樣;可選模組在收件時以一輪問答決定,
選「是」才把模組的檔案、規範與 ADR 疊進專案,選「否」就用基底的替代做法。

<!-- FILL: 收件時的情況:使用者是否在場、哪些題目是 SPEC 或訊息已經說明而沒有問。沒有特別情況就刪除這行。 -->

## 決策

套用順序固定為 i18n → dark-mode → msw → react-hook-form → ag-grid → permissions。「是否採用」只填「是」或「否」;
使用者沒回答而採用建議時,在「理由」寫「採用建議(暫定)」。

| 模組              | 是否採用                 | 細項                 | 理由                   |
| ----------------- | ------------------------ | -------------------- | ---------------------- |
| `i18n`            | {{I18N_SELECTED}}        | 無                   | {{I18N_REASON}}        |
| `dark-mode`       | {{DARK_MODE_SELECTED}}   | {{DARK_MODE_DETAIL}} | {{DARK_MODE_REASON}}   |
| `msw`             | {{MSW_SELECTED}}         | 無                   | {{MSW_REASON}}         |
| `react-hook-form` | {{RHF_SELECTED}}         | 無                   | {{RHF_REASON}}         |
| `ag-grid`         | {{AG_GRID_SELECTED}}     | {{AG_GRID_EDITION}}  | {{AG_GRID_REASON}}     |
| `permissions`     | {{PERMISSIONS_SELECTED}} | {{PERMISSIONS_API}}  | {{PERMISSIONS_REASON}} |

細項的寫法:`dark-mode` 寫「prototype 有深色」「保留骨架預設」或「從淺色推導」;`ag-grid` 寫「Enterprise」或「Community」;
`permissions` 寫權限清單的 API(例如「GET /permissions 回 string[]」)。
沒採用的模組細項寫「無」。

## 後果

沒採用的模組,基底用這些做法(規範在 `docs/conventions/` 的必選文件裡):

| 模組              | 選「否」時                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `i18n`            | 文案直接寫繁中字串;系統名稱在 `src/constants/app.ts`;錯誤文案在 `utils/describeError.ts`      |
| `dark-mode`       | 只有一組 `TOKENS`;沒有主題切換                                                                |
| `msw`             | 沒有 `dev:mock`;頁面測試以 `vi.mock('@/api/<資源>Api')` 換掉 API 模組                         |
| `react-hook-form` | 表單用 antd `Form.useForm` + `Form.Item name`                                                 |
| `ag-grid`         | 表格用 antd `Table`                                                                           |
| `permissions`     | 進得來就每頁每鈕都能用;只有存取閘門(`app/accessGate.ts`),沒有 `<RequirePermission>` 與 403 頁 |

採用的模組,規範在 `docs/conventions/<模組>.md`,基線 ADR 照原編號放在 `docs/adr/`(dark-mode 沒有基線 ADR;permissions 是 0012)。

之後要加選或拿掉模組時,新增一份 ADR 取代這份(在這份開頭註明「已由 ADR-NNNN 取代」),依 Skill 的模組 README 接線或拆除。

<!-- FILL: 這次選擇的代價與何時重新討論(例如:沒選 i18n,日後有海外使用者時;沒選 msw,後端長期未就緒時)。 -->
