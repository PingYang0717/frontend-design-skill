#!/usr/bin/env node
// 從 src/api/*Api.ts 與 src/types/api/ 反向產生後端 API 契約表 docs/api-contract.md,給後端(或後端的 agent)照著實作。
// 用法:node scripts/gen-api-contract.mjs [專案根目錄] [--check] [--out docs/api-contract.md]
//   --check:只比對,產出與現有檔不同就以 1 結束(CI 用,擋「改了 API 沒更新規格」)。
// 只認公版的寫法:export const xxx = (...) => apiClient.<method><T>(apiPath(...), body)(docs/conventions/api.md 第 3、7 節)。
// 解析不出來的 export 列在檔尾的「未解析的端點」並印 WARN,不算失敗。
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { createRequire } from 'node:module';

const args = process.argv.slice(2);
const flag = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : (args.splice(index, 2)[1] ?? true);
};
const check = args.includes('--check');
if (check) args.splice(args.indexOf('--check'), 1);
const outRel = flag('--out') ?? 'docs/api-contract.md';
const root = resolve(args[0] ?? process.cwd());
const apiDir = join(root, 'src', 'api');
if (!existsSync(apiDir)) {
  console.error(`找不到 ${relative(process.cwd(), apiDir) || 'src/api'};請在公版專案根目錄執行`);
  process.exit(2);
}

// 用專案自己的 TypeScript(與 typecheck 同一版),路徑別名與 strict 設定都照 tsconfig.app.json。
const ts = createRequire(join(root, 'package.json'))('typescript');
const configPath = join(root, 'tsconfig.app.json');
const parsed = ts.getParsedCommandLineOfConfigFile(
  configPath,
  {},
  {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
      process.exit(2);
    },
  }
);
const endpointFiles = readdirSync(apiDir)
  .filter((name) => /Api\.ts$/.test(name))
  .sort()
  .map((name) => join(apiDir, name));
const program = ts.createProgram(endpointFiles, { ...parsed.options, noEmit: true });
const checker = program.getTypeChecker();

/** 讀 src/app/accessGate.ts 的 ACCESS_GATE_RULES(只認 `{ kind: '...', status: N, code: '...' }` 這種寫法)。 */
const readAccessGateRules = () => {
  const file = join(root, 'src', 'app', 'accessGate.ts');
  if (!existsSync(file)) return [];
  const text = readFileSync(file, 'utf8');
  const block = text.match(/ACCESS_GATE_RULES[^=]*=\s*\[([\s\S]*?)\];/)?.[1] ?? '';
  return [...block.matchAll(/\{([^}]*)\}/g)].map(([, body]) => ({
    kind: body.match(/kind:\s*'([^']+)'/)?.[1],
    status: body.match(/status:\s*(\d+)/)?.[1],
    code: body.match(/code:\s*'([^']+)'/)?.[1],
  }));
};

/** 公版共用的錯誤處理(docs/conventions/error-handling.md 第 0 節、access.md);每支端點沒寫 @error 的狀態碼都補上這幾列。
 *  閘門(公司網路外、沒有系統權限)的狀態碼或 code 依專案的 app/accessGate.ts,這裡直接讀那張表。 */
const GATE_ERRORS = readAccessGateRules().map(({ kind, status, code }) => ({
  status: [status, code].filter(Boolean).join(' + ') || '(依 app/accessGate.ts)',
  when: kind === 'outsideNetwork' ? '不在公司網路內' : '沒有這個系統的使用權限',
  handling: '整頁遮罩(AccessMask),不能關閉',
}));
const SHARED_ERRORS = [
  { status: '401', when: '未登入或登入逾期', handling: '公司登入 SDK 跳轉登入畫面;前端不處理' },
  ...GATE_ERRORS,
  // 閘門已經用掉的狀態碼(例如 403)不再列成一般錯誤,避免同一個碼兩種說法。
  ...[
    { status: '403', when: '沒有這個操作的權限(閘門以外)', handling: '讀取 → 窗格錯誤卡;寫入 → toast' },
    {
      status: '5xx / 斷線',
      when: '伺服器錯誤或連不到後端',
      handling: '讀取 → 錯誤卡 + 重試;寫入 → toast;不顯示後端原話',
    },
  ].filter((row) => !GATE_ERRORS.some((gate) => gate.status === row.status)),
];

const warnings = [];
const typeRegistry = new Map(); // 型別名稱 → { fields | union }

const commentOf = (node) => {
  const docs = node.jsDoc ?? [];
  const last = docs[docs.length - 1];
  if (!last) return { summary: '', screens: [], errors: [] };
  const summary = (typeof last.comment === 'string' ? last.comment : (last.comment?.map((c) => c.text).join('') ?? ''))
    .split('\n')[0]
    .trim();
  const screens = [];
  const errors = [];
  for (const tag of last.tags ?? []) {
    const text = (
      typeof tag.comment === 'string' ? tag.comment : (tag.comment?.map((c) => c.text).join('') ?? '')
    ).trim();
    if (tag.tagName.text === 'screen') screens.push(text);
    if (tag.tagName.text === 'error') {
      // 格式:「狀態碼 情境 → 前端處理」;沒有箭頭就整句當情境。
      const [status, ...rest] = text.split(/\s+/);
      const [when, handling] = rest.join(' ').split(/\s*(?:→|->)\s*/);
      errors.push({ status, when: when ?? '', handling: handling ?? '(未寫,依公版共用規則)' });
    }
  }
  return { summary, screens, errors };
};

/** apiPath('items', id, 'detail') → /items/{id}/detail */
const pathOf = (call) =>
  '/' +
  call.arguments
    .map((arg) => (ts.isStringLiteral(arg) ? arg.text : `{${arg.getText().replace(/\s+/g, '')}}`))
    .join('/');

/** 把一個型別登記到型別表,回傳在表格裡顯示的名稱。 */
const registerType = (type, depth = 0) => {
  if (!type || depth > 4) return checker.typeToString(type);
  const text = checker.typeToString(type);
  if (text === 'void' || text === 'unknown' || text === 'any') return text;
  if (checker.isArrayType(type)) {
    const element = checker.getTypeArguments(type)[0];
    return `${registerType(element, depth + 1)}[]`;
  }
  const symbol = type.aliasSymbol ?? type.getSymbol();
  const name = type.aliasSymbol ? type.aliasSymbol.getName() : symbol?.getName();
  const isNamed = name && name !== '__type' && name !== '__object';
  if (isNamed && typeRegistry.has(name)) return name;
  if (type.isUnion() && type.types.every((t) => t.isStringLiteral() || t.isNumberLiteral())) {
    const values = type.types.map((t) => (t.isStringLiteral() ? `'${t.value}'` : String(t.value)));
    if (isNamed) typeRegistry.set(name, { union: values });
    return isNamed ? name : values.join(' \\| ');
  }
  const properties = checker.getPropertiesOfType(type);
  if (properties.length === 0 || (!isNamed && !type.isClassOrInterface() && !(type.flags & ts.TypeFlags.Object)))
    return text;
  const displayName = isNamed ? name : text;
  if (isNamed) typeRegistry.set(name, { fields: [] }); // 先佔位,避免遞迴型別無限展開
  const fields = properties.map((property) => {
    const declaration = property.valueDeclaration ?? property.declarations?.[0];
    const propertyType = checker.getTypeOfSymbolAtLocation(property, declaration ?? property.declarations?.[0]);
    const optional = Boolean(property.flags & ts.SymbolFlags.Optional);
    const nonNull = optional ? checker.getNonNullableType(propertyType) : propertyType;
    const doc = ts.displayPartsToString(property.getDocumentationComment(checker)).split('\n')[0];
    return { name: property.getName(), type: registerType(nonNull, depth + 1), optional, doc };
  });
  if (isNamed) typeRegistry.set(name, { fields });
  return isNamed ? displayName : `{ ${fields.map((f) => `${f.name}${f.optional ? '?' : ''}: ${f.type}`).join('; ')} }`;
};

const unwrapPromise = (type) => {
  const name = type.getSymbol()?.getName();
  return name === 'Promise' ? (checker.getTypeArguments(type)[0] ?? type) : type;
};

const endpoints = [];
const unresolved = [];
for (const file of endpointFiles) {
  const source = program.getSourceFile(file);
  const rel = relative(root, file);
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    if (!statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const name = declaration.name.getText();
      const init = declaration.initializer;
      if (!init || !ts.isArrowFunction(init)) continue;
      // 找函式體裡的 apiClient.<method>(apiPath(...), body?) 呼叫
      let call;
      const visit = (node) => {
        if (
          !call &&
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          node.expression.expression.getText() === 'apiClient'
        ) {
          call = node;
        }
        ts.forEachChild(node, visit);
      };
      visit(init.body);
      const firstArg = call?.arguments[0];
      const usesApiPath = firstArg && ts.isCallExpression(firstArg) && firstArg.expression.getText() === 'apiPath';
      if (!call || !usesApiPath) {
        unresolved.push({
          file: rel,
          name,
          reason: !call ? '沒有 apiClient.<method> 呼叫' : '路徑不是 apiPath() 組的',
        });
        continue;
      }
      const method = call.expression.name.text.toUpperCase();
      const path = pathOf(firstArg);
      const signature = checker.getSignatureFromDeclaration(init);
      const response = registerType(unwrapPromise(checker.getReturnTypeOfSignature(signature)));
      const params = init.parameters.map((parameter) => ({
        name: parameter.name.getText(),
        type: registerType(checker.getTypeAtLocation(parameter)),
        optional: Boolean(parameter.questionToken || parameter.initializer),
      }));
      const bodyArg = call.arguments[1];
      const bodyParam = bodyArg && params.find((p) => p.name === bodyArg.getText());
      const pathParams = params.filter((p) => path.includes(`{${p.name}}`));
      const others = params.filter((p) => p !== bodyParam && !pathParams.includes(p));
      const doc = commentOf(statement);
      const statuses = new Set(doc.errors.map((e) => e.status));
      endpoints.push({
        file: rel,
        name,
        method,
        path,
        summary: doc.summary,
        screens: doc.screens,
        pathParams,
        body:
          bodyParam ??
          (bodyArg ? { name: bodyArg.getText(), type: registerType(checker.getTypeAtLocation(bodyArg)) } : null),
        others,
        response,
        errors: [...doc.errors, ...SHARED_ERRORS.filter((e) => !statuses.has(e.status))],
      });
    }
  }
}
for (const item of unresolved) warnings.push(`${item.file} 的 ${item.name}:${item.reason},沒有列進契約表`);

// ---- 輸出 Markdown ----
const esc = (text) =>
  String(text ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
const lines = [];
lines.push('# 後端 API 契約表');
lines.push('');
lines.push(
  '> 由 `scripts/gen-api-contract.mjs` 從 `src/api/*Api.ts` 與 `src/types/api/` 產生(`npm run api-contract`)。' +
    '**不要手改**:改端點函式的 JSDoc(`@screen`、`@error`)或 DTO 後重跑;CI 以 `--check` 比對,不一致就失敗。'
);
lines.push('>');
lines.push(
  '> 慣例:路徑的 `{id}` 是路徑參數;Request 的 body 以 JSON 送;Response 直接是 body(沒有外層包裝);' +
    '`?` 是選填欄位;列舉值逐字一致(docs/conventions/api.md 第 4 節)。'
);
lines.push('');
lines.push('## 端點一覽');
lines.push('');
lines.push('| 端點 | 方法與路徑 | 功能 | 來源 |');
lines.push('| --- | --- | --- | --- |');
for (const e of endpoints) {
  lines.push(
    `| [${e.name}](#${e.name.toLowerCase()}) | \`${e.method} ${e.path}\` | ${esc(e.summary) || '(JSDoc 未寫功能)'} | \`${e.file}\` |`
  );
}
lines.push('');
for (const e of endpoints) {
  lines.push(`## ${e.name}`);
  lines.push('');
  lines.push(`\`${e.method} ${e.path}\``);
  lines.push('');
  lines.push(`- **功能**:${e.summary || '(JSDoc 未寫功能;請在 ' + e.file + ' 的函式註解第一行補上)'}`);
  lines.push(`- **使用畫面**:${e.screens.length > 0 ? e.screens.map(esc).join('、') : '(未標 @screen)'}`);
  lines.push('');
  lines.push('**Request**');
  lines.push('');
  if (e.pathParams.length === 0 && !e.body && e.others.length === 0) {
    lines.push('無。');
  } else {
    lines.push('| 位置 | 名稱 | 型別 | 必填 |');
    lines.push('| --- | --- | --- | --- |');
    for (const p of e.pathParams) lines.push(`| 路徑 | \`${p.name}\` | \`${esc(p.type)}\` | 是 |`);
    if (e.body) lines.push(`| body | — | \`${esc(e.body.type)}\` | ${e.body.optional ? '否' : '是'} |`);
    for (const p of e.others) lines.push(`| 其他 | \`${p.name}\` | \`${esc(p.type)}\` | ${p.optional ? '否' : '是'} |`);
  }
  lines.push('');
  lines.push('**Response**');
  lines.push('');
  lines.push(e.response === 'void' ? '無 body(2xx 即成功)。' : `\`${esc(e.response)}\``);
  lines.push('');
  lines.push('**預期錯誤與前端處理**');
  lines.push('');
  lines.push('| 狀態碼 | 情境 | 前端處理 |');
  lines.push('| --- | --- | --- |');
  for (const err of e.errors) lines.push(`| ${esc(err.status)} | ${esc(err.when)} | ${esc(err.handling)} |`);
  lines.push('');
}
lines.push('## 型別');
lines.push('');
lines.push('欄位名、大小寫、列舉值與後端逐字一致;前端不改名、不設轉換層。');
lines.push('');
for (const [name, def] of typeRegistry) {
  lines.push(`### ${name}`);
  lines.push('');
  if (def.union) {
    lines.push(`列舉:${def.union.join(' \\| ')}`);
  } else {
    lines.push('| 欄位 | 型別 | 必填 | 說明 |');
    lines.push('| --- | --- | --- | --- |');
    for (const f of def.fields)
      lines.push(`| \`${f.name}\` | \`${esc(f.type)}\` | ${f.optional ? '否' : '是'} | ${esc(f.doc)} |`);
  }
  lines.push('');
}
if (unresolved.length > 0) {
  lines.push('## 未解析的端點');
  lines.push('');
  lines.push('下列 export 不是公版寫法(`apiClient.<method>(apiPath(...))`),腳本讀不出方法與路徑;改成公版寫法後重跑。');
  lines.push('');
  for (const item of unresolved) lines.push(`- \`${item.file}\` 的 \`${item.name}\`:${item.reason}`);
  lines.push('');
}
const output = lines.join('\n');

const outPath = join(root, outRel);
if (check) {
  const current = existsSync(outPath) ? readFileSync(outPath, 'utf8') : '';
  if (current !== output) {
    console.error(`${outRel} 與 src/api、src/types/api 不一致;執行 npm run api-contract 後再 commit`);
    process.exit(1);
  }
  console.log(`${outRel} 與程式碼一致(${endpoints.length} 支端點)`);
} else {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, output);
  console.log(`已產生 ${outRel}:${endpoints.length} 支端點、${typeRegistry.size} 個型別`);
}
for (const message of warnings) console.warn(`WARN   ${message}`);
