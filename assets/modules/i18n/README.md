# 模組:i18n(多語系字典)

介面文案集中在 typed 字典(`src/i18n/zhTW.ts`、`en.ts`),header 有語言切換,兩支守門測試擋漏翻與寫死的字。
沒選這個模組時,基底的文案直接寫繁中字串,系統名稱在 `src/constants/app.ts`。

套用順序第 1 個,後面的模組依「有沒有選 i18n」決定要不要多疊 `files.with-i18n/`。

## 1. 安裝套件

不需要。antd 的 `en_US` 語系檔在 antd 裡。

## 2. 複製檔案

```bash
cp -R <skill>/assets/modules/i18n/files/. <project>/
rm <project>/src/constants/app.ts   # 系統名稱改由字典 app.name 提供
```

`files/` 新增 `src/i18n/`(字典、`useTranslations`、語言名稱、兩支守門測試)與 `src/stores/useLanguageStore.ts`,
並以字典版**覆蓋**基底的這些檔案(內容與基底相同,只是文字改為引用字典):

| 類別     | 檔案                                                                                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 共用零件 | `components/common/LoadErrorPanel.tsx`、`SuspenseLoader.tsx`                                                                                             |
| 外殼     | `components/layouts/AppHeader.tsx`(加語言選單)、`AppShell.tsx`、`PublicLayout.tsx`、`RootLayout.tsx`、`UserMenu.tsx`、`navEntries.tsx`(`label` 改為函式) |
| 頁面     | `pages/Forbidden/`、`pages/NotFound/`、`pages/Home/HomePage.tsx`、`pages/Login/LoginPage.tsx`、`pages/Items/ItemsPage.tsx`                               |
| 範例功能 | `components/items/ItemTable.tsx`、`ItemCreateDialog.tsx`、`hooks/useItemMutations.ts`                                                                    |
| 其他     | `hooks/useActionErrorToast.ts`、`useConfirmDestructive.ts`、`utils/describeError.ts`(錯誤文案改查 `errors.byCode`)                                       |
| 測試     | `test/setup.ts`(每個測試後語言還原為繁中)、6 支頁面與守衛測試(斷言改引用字典)                                                                            |

## 3. 修改既有檔案

**`src/constants/storage.ts`**:在 `LAYOUT_STORAGE_KEY` 上一行加

```ts
export const LANGUAGE_STORAGE_KEY = `${PREFIX}:language`;
```

**`src/app/providers.tsx`**:antd 語系跟著介面語言,`<html lang>` 跟著切換。

1. 第一行改成 `import React, { type ReactNode, useEffect, useState } from 'react';`
2. `import zhTW from 'antd/locale/zh_TW';` 的上一行加 `import enUS from 'antd/locale/en_US';`
3. `import { buildAntdTheme } ...` 的上一行加 `import { useLanguageStore } from '@/stores/useLanguageStore';`
4. 元件內 `const [queryClient] = useState(createQueryClient);` 的**上一行**加
   `const language = useLanguageStore((state) => state.language);`;**下一行**加

   ```tsx
   // 同步外部系統:<html lang> 跟著介面語言,螢幕閱讀器才會用對的語音念。
   useEffect(() => {
     document.documentElement.lang = language;
   }, [language]);
   ```

5. `locale={zhTW}` 改成 `locale={language === 'en' ? enUS : zhTW}`

**`.azuredevops/pull_request_template.md`**:「自我檢查」第一項下面加

```md
- [ ] 新增或修改的畫面文案都在 i18n 字典裡
```

## 4. 測試

新增 `src/i18n/noBareLiterals.test.ts`(components/、pages/ 不得有寫死的文案)與
`src/i18n/errorCodeCoverage.test.ts`(每個錯誤 code 在每個語言都有文案),都在 `files/` 裡。

## 5. 與其他模組的互動

i18n 是第一個套用的模組,後面的模組都會看它:

| 模組            | 有選 i18n 時                                                                       |
| --------------- | ---------------------------------------------------------------------------------- |
| dark-mode       | 多疊 `files.with-i18n/`;字典 `header` 加 `theme`、`light`、`dark`(見該模組 README) |
| msw             | 多疊 `files.with-i18n/`(測試與 setup 的斷言引用字典)                               |
| react-hook-form | 多疊 `files.with-i18n/`(登入頁與 Item 對話框的文字引用字典)                        |
| ag-grid         | 多疊 `files.with-i18n/`(`DataGrid` 的內建文案跟語言切換、`ItemTable` 引用字典)     |

## 6. 規範與 ADR

```bash
cp <skill>/assets/modules/i18n/standard.md <project>/docs/conventions/i18n.md
cp <skill>/assets/modules/i18n/adr.md <project>/docs/adr/0010-ui-copy-in-typed-dictionary.md
```

## 7. 之後的開發

- 新文案:`zhTW.ts` 加條目(形狀來源)→ `en.ts` 補同一條(型別強制)→ 元件用 `useTranslations()` 引用
- 移除 Item 範例時,字典的 `items` 區塊與 `nav.items` 一起刪;沒有首頁時刪 `nav.home` 與 `pages.home`
- 細則見 `docs/conventions/i18n.md`
