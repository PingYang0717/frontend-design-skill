import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/** 型別系統只能保證「進了字典的字」不會漏翻;直接寫在 JSX 裡的字照樣能編譯,但永遠不會被翻譯。
 *  這支測試掃 components/ 與 pages/,找出三種常見形狀:JSX 文字節點、label= / placeholder= / title=
 *  的字串值。判斷是刻意保守的啟發式:物件屬性裡的字串(`label: '...'`)抓不到,靠 review。
 *  真的需要留下的字面值,加進 ALLOWED 並寫明理由;語言名稱這類不翻譯的值放 i18n/languages.ts。 */

const SRC = join(import.meta.dirname, '..');
const SCAN_DIRS = ['components', 'pages'];

/** 檔案路徑(相對 src/)→ 允許保留的字面值,每一條都要附理由。 */
const ALLOWED: Record<string, string[]> = {};

const listTsx = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      return listTsx(full);
    }
    return entry.name.endsWith('.tsx') && !entry.name.includes('.test.') ? [full] : [];
  });

/** 含任何字母或中日韓文字的字串才算文案;純符號、數字不算。 */
const HAS_WORDS = /[A-Za-z㐀-鿿]/;
// `>` 前面不能是 `=` 或 `-`(箭頭函式、比較運算);文字裡不含程式碼常見的 ; = ( )。
const JSX_TEXT = /(?<![=-])>([^<>{}`;=()]+)</g;
const TEXT_PROPS = /\b(?:label|placeholder|title|aria-label|okText|cancelText)="([^"]+)"/g;

const findLiterals = (source: string): string[] => {
  const found: string[] = [];
  for (const pattern of [JSX_TEXT, TEXT_PROPS]) {
    for (const match of source.matchAll(pattern)) {
      const text = match[1].trim();
      if (text && HAS_WORDS.test(text)) {
        found.push(text);
      }
    }
  }
  return found;
};

describe('no bare UI literals', () => {
  const files = SCAN_DIRS.flatMap((dir) => listTsx(join(SRC, dir)));

  it.each(files.map((file) => [relative(SRC, file), file]))('%s puts its copy in the dictionary', (rel, file) => {
    const allowed = ALLOWED[rel] ?? [];
    const literals = findLiterals(readFileSync(file, 'utf8')).filter((text) => !allowed.includes(text));
    expect(literals).toEqual([]);
  });
});
