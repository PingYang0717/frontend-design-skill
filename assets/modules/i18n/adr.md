# 0010. 介面文案放在 typed 字典,不引入 i18n 函式庫

## 背景

介面文案散寫在 JSX 裡時,改一句話要全專案搜尋;要加第二種語言時,得先把每一個字面量找
出來。多數 i18n 函式庫用字串 key(`t('items.title')`):打錯 key 編譯得過,漏翻在執行期才
以 fallback 或 missing-key 佔位符出現——要有人切過去才看得見。

我們的需求是一到兩種語言、由使用者手動切換;複數規則、命名空間、按需載入都用不到。

## 決策

**自建 typed 字典,不裝 i18n 函式庫。即使專案只有一種語言也走字典。**

- **`src/i18n/zhTW.ts` 是文案與形狀的來源**;`Translations` 由 `typeof zhTW` 推導,
  `en.ts` 宣告成 `const en: Translations`——少一條或多一條都是編譯錯誤。
- **巢狀物件,沒有字串 key**:`t.items.title`。打錯字不可能發生,全程有自動完成。
- **帶變數的條目寫成函式**,不用佔位符模板:語序由各語言自己決定
  (`` (what) => `${what}載入中…` `` vs `` (what) => `Loading ${what}…` ``)。
- **元件用 `useTranslations()`;** 非元件(錯誤判讀、class component)用
  `getTranslations()`。
- **`aria-label` 也進字典。** 它是使用者(透過螢幕閱讀器)讀到的文字,不是測試用的識別字。
- **enum 的顯示文字以 `satisfies Record<ItemStatus, string>` 對齊 DTO**,後端加值時漏寫是
  編譯錯誤。
- 預設 zh-TW,不讀瀏覽器語言;使用者的選擇由 `useLanguageStore` 記在 localStorage。
- **測試固定以預設語言執行**(`test/setup.ts`),斷言一律引用字典,不寫死文字。
- 這是可選模組:專案收件時決定要不要用(ADR-0022);沒選時文案直接寫繁中字串,沒有字典與守門測試。
- **例外:語言選單的語言名稱不進字典。** 它們放在 `src/i18n/languages.ts` 的
  `LANGUAGE_LABELS`,一律用該語言自己的寫法(「繁體中文」「English」):切到英文時,使用者
  仍要認得出「繁體中文」才切得回來。新增語言時在這裡加一列。

### 兩支守門測試

型別只管「已入典」的條目。直接寫在 JSX 裡的字照樣能編譯,也永遠不會被翻譯:

- **`i18n/noBareLiterals.test.ts`** 掃 `components/` 與 `pages/` 的 JSX 文字節點與
  `label=` / `placeholder=` / `title=` / `aria-label=` 等字串屬性。真的要留的字面量加進
  `ALLOWED` 並寫理由。
- **`i18n/errorCodeCoverage.test.ts`** 確認每個已知錯誤 code 在每種語言都有文案
  ([ADR-0007](0007-error-copy-owned-by-frontend.md))。

✅

```tsx
<Input.Search aria-label={t.common.search} placeholder={t.items.searchPlaceholder} />
<Tag>{t.items.status[item.status]}</Tag>
```

```ts
delete: {
  label: (name: string) => `刪除 ${name}`,
},
```

❌

```tsx
<Input.Search aria-label="Search" placeholder="依名稱搜尋" />
```

```ts
label: '刪除 {name}', // 佔位符模板:語序被第一個寫的語言綁死
```

規則細節見 [`i18n.md`](../conventions/i18n.md)。

## 後果

- 漏翻是編譯錯誤,裸字面量由測試擋;改文案只動字典一處。
- 換一種語言時,不必改任何測試的斷言。
- **型別擋不住「英文欄位原封抄了中文」**,那編譯得過;靠 review。
- `noBareLiterals` 是保守的啟發式:寫在物件屬性(例如 `options` 陣列的 `label:`)或
  `{'...'}` 裡的字串掃不到,靠 review 補。
- 沒有日期、數字的在地化格式工具;需要時用瀏覽器內建的 `Intl`。

### 何時重新討論

- 語言超過三種、需要複數規則、或文案交給翻譯團隊用外部平台維護時,評估 i18n 函式庫——
  但要保留「漏翻是編譯錯誤」這項保證。
- 字典大到影響首屏載入時,考慮依語言分包。
