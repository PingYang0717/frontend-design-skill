#!/usr/bin/env node
// 檢查專案是否還有沒填的範本內容或沒換掉的骨架預設值。用法:node <skill>/scripts/check-placeholders.mjs <專案根目錄>
// 結束碼:有 ERROR 為 1,只有 WARN 或全部通過為 0。
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv[2];
if (!root || !existsSync(root)) {
  console.error('用法:node check-placeholders.mjs <專案根目錄>');
  process.exit(2);
}

const errors = [];
const warnings = [];

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    if (name === 'node_modules' || name === '.git' || name === 'dist') return [];
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

// 1. 文件裡的 {{PLACEHOLDER}} 與 FILL 標記(docs/templates/ 是給之後複製用的空白範本,本來就帶著 placeholder)
const PLACEHOLDER = /\{\{[A-Z][A-Z0-9_]*\}\}/g;
const FILL = /<!--\s*FILL\b/;
const docFiles = [
  ...['README.md', 'AGENTS.md', 'CLAUDE.md'].map((f) => join(root, f)),
  ...(existsSync(join(root, 'docs')) ? walk(join(root, 'docs')) : []),
].filter((f) => existsSync(f) && f.endsWith('.md') && !relative(root, f).startsWith(join('docs', 'templates')));

for (const file of docFiles) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      const where = `${relative(root, file)}:${index + 1}`;
      for (const match of line.matchAll(PLACEHOLDER)) errors.push(`${where} 未替換的 ${match[0]}`);
      if (FILL.test(line)) errors.push(`${where} 未填寫的 FILL 區塊`);
    });
}

// 2. src 裡的 {{PLACEHOLDER}} 與標了「草案」的 DTO(後者只提醒)
if (existsSync(join(root, 'src'))) {
  for (const file of walk(join(root, 'src'))) {
    const text = readFileSync(file, 'utf8');
    for (const match of text.matchAll(PLACEHOLDER)) errors.push(`${relative(root, file)} 未替換的 ${match[0]}`);
    if (file.includes(join('types', 'api')) && text.includes('草案')) {
      warnings.push(`${relative(root, file)} 是草案,尚未與後端確認契約`);
    }
  }
}

// 3. 選用模組(docs/adr/0022-selected-modules.md 的表格:一列一模組,「是否採用」寫「是」或「否」)
const readIf = (rel) => (existsSync(join(root, rel)) ? readFileSync(join(root, rel), 'utf8') : '');
const SELECTED_MODULES_ADR = 'docs/adr/0022-selected-modules.md';
/** 模組 → 選了才有的檔案(用來比對 0022 與實際疊上的模組)與規範檔名。 */
const MODULES = {
  i18n: { marker: 'src/i18n/zhTW.ts', standard: 'i18n.md' },
  'dark-mode': { marker: 'src/stores/useThemeStore.ts', standard: 'dark-mode.md' },
  msw: { marker: 'src/mocks/handlers.ts', standard: 'msw.md' },
  'react-hook-form': { marker: 'src/components/common/FormField.tsx', standard: 'react-hook-form.md' },
  'ag-grid': { marker: 'src/components/common/DataGrid.tsx', standard: 'ag-grid.md' },
};
const selected = new Set();
const selectedText = readIf(SELECTED_MODULES_ADR);
if (!selectedText) {
  errors.push(`缺少 ${SELECTED_MODULES_ADR}(範本 templates/adr-selected-modules.md);無法判斷選了哪些模組`);
} else {
  // 只讀「## 決策」一節的表格;「## 後果」也有一列一模組的表,不能讀到它。
  const decision = selectedText.split(/^## /m).find((section) => section.startsWith('決策')) ?? '';
  const rows = new Map();
  for (const line of decision.split('\n')) {
    const cells = line.split('|').map((cell) => cell.trim().replace(/`/g, ''));
    if (cells.length > 3 && cells[1] in MODULES && !rows.has(cells[1])) rows.set(cells[1], cells[2]);
  }
  for (const name of Object.keys(MODULES)) {
    const answer = rows.get(name);
    if (answer === undefined) errors.push(`${SELECTED_MODULES_ADR} 缺少模組 ${name} 這一列`);
    else if (answer.startsWith('是')) selected.add(name);
    else if (!answer.startsWith('否'))
      errors.push(`${SELECTED_MODULES_ADR} 的 ${name}「是否採用」要寫「是」或「否」,目前是「${answer}」`);
  }
  for (const [name, { marker, standard }] of Object.entries(MODULES)) {
    if (!/^[是否]/.test(rows.get(name) ?? '')) continue; // 沒有這列或答案無效:上面已報錯
    const has = existsSync(join(root, marker));
    if (selected.has(name) && !has)
      errors.push(`0022 選了 ${name},但沒有 ${marker};依 assets/modules/${name}/README.md 接線`);
    if (!selected.has(name) && has) errors.push(`0022 沒選 ${name},但專案裡有 ${marker}`);
    if (selected.has(name) && !existsSync(join(root, 'docs/conventions', standard)))
      errors.push(`0022 選了 ${name},但缺少 docs/conventions/${standard}`);
  }
}
for (const rel of ['docs/conventions/README.md', 'docs/adr/README.md']) {
  if (readIf(rel).includes('選用時才有'))
    errors.push(`${rel} 還有「(模組:xxx,選用時才有)」標記;沒選的模組刪列,選了的刪標記`);
}

// 4. 骨架預設值沒換掉
if (/"name":\s*"app-skeleton"/.test(readIf('package.json'))) errors.push('package.json 的 name 仍是 app-skeleton');
if (/"name":\s*"app-skeleton"/.test(readIf('package-lock.json')))
  errors.push('package-lock.json 的 name 仍是 app-skeleton(執行 npm install 會跟著更新)');
if (/<title>App<\/title>/.test(readIf('index.html'))) errors.push('index.html 的 <title> 仍是預設值 App');
if (selected.has('i18n')) {
  if (readIf('src/i18n/zhTW.ts').includes("name: '系統名稱'")) errors.push('src/i18n/zhTW.ts 的 app.name 仍是預設值');
  if (readIf('src/i18n/en.ts').includes("name: 'App name'")) errors.push('src/i18n/en.ts 的 app.name 仍是預設值');
} else if (readIf('src/constants/app.ts').includes("APP_NAME = '系統名稱'")) {
  errors.push('src/constants/app.ts 的 APP_NAME 仍是預設值');
}

// 5. 規格與 prototype 原檔要在 repo 裡;收件時決定的專案 ADR 要在
for (const [dir, what] of [
  ['docs/spec', '規格'],
  ['docs/prototype', 'prototype'],
]) {
  const full = join(root, dir);
  const files = existsSync(full) ? readdirSync(full).filter((f) => !f.startsWith('.')) : [];
  if (files.length === 0) errors.push(`${dir}/ 沒有任何檔案;${what}原檔要放進 repo`);
}
for (const rel of ['docs/adr/0020-router-mode.md', 'docs/adr/0021-auth-mode.md']) {
  if (!existsSync(join(root, rel))) errors.push(`缺少 ${rel}`);
}

// 6. 範例功能仍在(全部畫面完成後應刪除);依選用的模組多查假資料與字典
const EXAMPLE_FILES = [
  'src/types/api/item.ts',
  'src/api/itemApi.ts',
  'src/hooks/useItems.ts',
  'src/hooks/useItemMutations.ts',
  'src/components/items',
  'src/pages/Items',
];
const remaining = EXAMPLE_FILES.filter((rel) => existsSync(join(root, rel)));
const EXAMPLE_TEXT = [
  ...(selected.has('msw')
    ? [
        ['src/mocks/handlers.ts', "api('/items"],
        ['src/mocks/db.ts', 'seedItems'],
      ]
    : [['src/test/fixtures.ts', 'testItems']]),
  ...(selected.has('i18n') ? [['src/i18n/zhTW.ts', '\n  items: {']] : []),
];
for (const [rel, needle] of EXAMPLE_TEXT) {
  if (readIf(rel).includes(needle)) remaining.push(`${rel} 的 ${needle.trim()}`);
}
if (remaining.length > 0) {
  errors.push(`骨架的範例功能(Item)仍在:${remaining.join('、')}。全部畫面完成後要移除(workflow-detail.md 步驟 4)。`);
}

for (const message of errors) console.log(`ERROR  ${message}`);
for (const message of warnings) console.log(`WARN   ${message}`);
console.log(`\n${errors.length} 個錯誤,${warnings.length} 個警告`);
process.exit(errors.length > 0 ? 1 : 0);
