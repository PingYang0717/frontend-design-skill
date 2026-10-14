# 0016. 依賴版本:`^` 範圍 + lockfile 進版控;本機 `npm install`、CI `npm ci`

## 背景

依賴版本有兩種常見做法:`package.json` 鎖死確切版本(`"react": "19.3.0"`),或用 `^` 範圍
並靠 lockfile 固定實際安裝的版本。

鎖死版本看似安全,但它只鎖了直接依賴,間接依賴照樣浮動;每次升級都要手改大量版本號,
最後變成沒人升級。反過來,只有 `^` 而沒有 lockfile,每個人與 CI 拿到的版本都可能不同,
「我這邊是好的」就無從查起。

## 決策

**1. `package.json` 用 `^` 範圍。** 表達「相容於這個主版本的哪個最低版本」。例外:
TypeScript 用 `~`(`"typescript": "~6.0.3"`),因為它的 minor 版本可能帶來型別檢查的
破壞性變更。

**2. `package-lock.json` 進版控。** 它是實際安裝版本的唯一事實,包含所有間接依賴。

**3. 本機一律 `npm install`,CI 一律 `npm ci`。** `npm install` 依 lockfile 安裝,lockfile 與
`package.json` 不一致時會修正 lockfile;`npm ci` 只依 lockfile 安裝,不一致就失敗。
把嚴格的那個放在 CI(`azure-pipelines.yml`),讓「lockfile 沒跟著 commit」在 PR 就被擋下,
本機則不必為了裝依賴先清掉 `node_modules`。

**4. lockfile 的變更要看、要一起 commit。** `npm install` 後 `package-lock.json` 有 diff,代表
`package.json` 改了或 lockfile 本來就不一致;確認是預期的變更再與 `package.json` 一起 commit。
不是刻意改依賴卻出現大量 diff,先 `git checkout package-lock.json` 再查原因,不要直接 commit。

**5. Node 版本寫在 `package.json` 的 `engines`。** CI 的 `NodeTool` 版本與它對齊。不另放
`.nvmrc`。

**6. 升級是一個獨立的 PR。** 升級套件不和功能改動混在一起,PR 要過完整的
lint → typecheck → test → build。

✅

```json
"dependencies": {
  "react": "^19.3.0",
  "@tanstack/react-query": "^5.104.2"
},
"devDependencies": {
  "typescript": "~6.0.3"
}
```

```bash
git clone … && npm install        # 本機
npm install antd@^6.7.0           # 刻意升級,commit package.json 與 package-lock.json
```

```yaml
# azure-pipelines.yml:CI 用 ci,lockfile 不一致直接失敗
- script: npm ci
```

❌

```bash
rm package-lock.json && npm install   # 「解決」衝突
```

```gitignore
package-lock.json
```

lockfile 合併衝突時,不手改內容:先解 `package.json` 的衝突,取目標分支的 lockfile 後重新
`npm install`,讓 npm 重建。規則細節見 [`tooling.md`](../conventions/tooling.md)、
[`tech-stack.md`](../conventions/tech-stack.md)。

## 後果

- 所有人與 CI 安裝到逐位元相同的依賴樹;問題可以重現。
- 升級是刻意的動作,會在 PR 裡留下 lockfile diff,review 看得到。
- `^` 範圍讓 `npm install <pkg>` 時 npm 能找到相容的組合,不必手動解版本衝突。
- lockfile diff 很大,review 時看 `package.json` 的變動即可,lockfile 交給 CI 驗證。
- 本機用 `npm install` 多了一個責任:lockfile 的 diff 要自己判斷是不是預期的。
- 沒有自動升級機制;團隊要定期安排升級,否則會累積成一次大升級。

### 何時重新討論

- 改用其他套件管理器(pnpm、yarn)時,改寫本 ADR,對應的 lockfile 與 CI 指令一併替換。
- 引入自動升級工具(例如 Renovate、Dependabot)時,補上升級 PR 的處理規則。
- 某個套件的 `^` 範圍內出現破壞性變更時,對該套件改用 `~` 或確切版本,並在 ADR 記錄。
