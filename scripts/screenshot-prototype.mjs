#!/usr/bin/env node
// 依 docs/prototype/screens.json 對 prototype 的每個畫面截圖,存到 docs/prototype/screens/<id>.png(有深色再存 <id>-dark.png)。
// 用法:node <skill>/scripts/screenshot-prototype.mjs <專案根目錄> [--only <id>,<id>]
// 需要先在 <skill> 跑過 npm ci 與 npx playwright install chromium(Playwright 是 Skill 自己的 devDependency,不進專案骨架)。
// 機器上已有別的 Chromium(例如 CI 預裝的)時,用 CHROMIUM_EXECUTABLE=<路徑> 指定,不必再下載。
// 結束碼:任一畫面失敗為 1;全部成功為 0。失敗的畫面會列出原因,其他畫面照常輸出。
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { chromium } from 'playwright';

const [root, ...rest] = process.argv.slice(2);
if (!root || !existsSync(root)) {
  console.error('用法:node screenshot-prototype.mjs <專案根目錄> [--only <id>,<id>]');
  process.exit(2);
}
const onlyIndex = rest.indexOf('--only');
const only = onlyIndex >= 0 ? new Set((rest[onlyIndex + 1] ?? '').split(',').filter(Boolean)) : undefined;

const configPath = join(root, 'docs', 'prototype', 'screens.json');
if (!existsSync(configPath)) {
  console.error(`找不到 ${relative(root, configPath)};步驟 2 分析時要先依 templates/prototype-screens.json 填好。`);
  process.exit(2);
}
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const prototypeFile = resolve(dirname(configPath), config.file);
if (!existsSync(prototypeFile)) {
  console.error(`screens.json 的 file 指向不存在的檔案:${prototypeFile}`);
  process.exit(2);
}
if (/\{\{[A-Z][A-Z0-9_]*\}\}/.test(config.file)) {
  console.error('screens.json 的 file 仍是 placeholder,請填 prototype 檔名。');
  process.exit(2);
}

const outDir = join(dirname(configPath), 'screens');
mkdirSync(outDir, { recursive: true });

const baseUrl = pathToFileURL(prototypeFile).href;
const settleMs = config.settleMs ?? 500;

/** 一個 step 只做一件事;不認得的 key 直接報錯,不要靜靜跳過。 */
const runStep = async (page, step) => {
  if ('hash' in step) {
    await page.goto(`${baseUrl}${step.hash}`);
    return;
  }
  if ('click' in step) {
    await page.locator(step.click).first().click();
    return;
  }
  if ('fill' in step) {
    await page.locator(step.fill.selector).first().fill(step.fill.value);
    return;
  }
  if ('wait' in step) {
    await page.waitForTimeout(step.wait);
    return;
  }
  throw new Error(`不認得的 step:${JSON.stringify(step)}`);
};

const capture = async (browser, screen, dark) => {
  const context = await browser.newContext({
    viewport: config.viewport ?? { width: 1440, height: 900 },
    colorScheme: dark ? 'dark' : 'light',
  });
  const page = await context.newPage();
  // 找不到元素就快點失敗並回報,不要等 Playwright 預設的 30 秒。
  page.setDefaultTimeout(config.stepTimeoutMs ?? 5000);
  try {
    await page.goto(baseUrl);
    if (dark) {
      for (const step of config.dark) await runStep(page, step);
    }
    for (const step of screen.steps ?? []) await runStep(page, step);
    await page.waitForTimeout(settleMs);
    const file = join(outDir, `${screen.id}${dark ? '-dark' : ''}.png`);
    await page.screenshot({ path: file, fullPage: config.fullPage ?? true });
    console.log(`OK     ${relative(root, file)}`);
  } finally {
    await context.close();
  }
};

const executablePath = process.env.CHROMIUM_EXECUTABLE;
if (executablePath && !existsSync(executablePath)) {
  console.error(`CHROMIUM_EXECUTABLE 指向不存在的檔案:${executablePath}`);
  process.exit(2);
}
const browser = await chromium.launch({ executablePath }).catch((error) => {
  console.error(error instanceof Error ? error.message.split('\n')[0] : error);
  console.error(
    '瀏覽器啟動失敗:在 <skill> 跑 `npx playwright install chromium`,或以 CHROMIUM_EXECUTABLE 指定既有的 Chromium。'
  );
  process.exit(2);
});
let failed = 0;
for (const screen of config.screens ?? []) {
  if (only && !only.has(screen.id)) continue;
  for (const dark of config.dark ? [false, true] : [false]) {
    try {
      await capture(browser, screen, dark);
    } catch (error) {
      failed += 1;
      console.log(
        `FAIL   ${screen.id}${dark ? ' (dark)' : ''}:${error instanceof Error ? error.message.split('\n')[0] : error}`
      );
    }
  }
}
await browser.close();

console.log(`\n${failed} 個失敗`);
process.exit(failed > 0 ? 1 : 0);
