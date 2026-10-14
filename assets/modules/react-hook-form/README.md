# 模組:react-hook-form(表單)

表單狀態與驗證交給 React Hook Form,antd 只管版面與輸入元件,兩者由公版 `components/common/FormField.tsx` 接起來;
公版登入頁與 Item 範例的新增對話框都改用 `useForm` + `FormField`。
沒選這個模組時,基底的表單用 antd `Form.useForm` + `Form.Item name`。

套用順序第 4 個(在 i18n、dark-mode、msw 之後)。

## 1. 安裝套件

```bash
npm install react-hook-form@^7.90.0
```

## 2. 複製檔案

```bash
cp -R <skill>/assets/modules/react-hook-form/files/. <project>/
# 有選 i18n 時再疊:
cp -R <skill>/assets/modules/react-hook-form/files.with-i18n/. <project>/
```

| 檔案                                        | 說明                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| `src/components/common/FormField.tsx`       | 新增:`Controller` ↔ antd `Form.Item`,負責 label 關聯、必填星號、錯誤訊息 |
| `src/pages/Login/LoginPage.tsx`             | **覆蓋**基底:`useForm<LoginRequest>` + 兩個 `FormField`;畫面與行為不變   |
| `src/components/items/ItemCreateDialog.tsx` | **覆蓋**基底:`useForm<CreateItemRequest>` + `FormField`                  |

`files/` 的驗證訊息直接寫繁中字串;`files.with-i18n/` 的版本引用字典(`t.pages.login.*`、`t.items.create.*`)。

## 3. 修改既有檔案

不需要。

## 4. 測試

不新增測試檔。`LoginPage.test.tsx`(必填訊息、錯誤帳密)與 `ItemsPage.test.tsx`(新增對話框)以 label 與訊息文字斷言,
antd Form 與 React Hook Form 兩種實作都適用,已涵蓋 `FormField`。

## 5. 與其他模組的互動

| 模組      | 互動                                                                                           |
| --------- | ---------------------------------------------------------------------------------------------- |
| i18n      | 有選:多疊 `files.with-i18n/`;沒選:`files/` 的繁中字串直接用,`APP_NAME` 取自 `constants/app.ts` |
| dark-mode | 無                                                                                             |
| msw       | 無(測試只看畫面,不看表單實作)                                                                  |
| ag-grid   | 無                                                                                             |

## 6. 規範與 ADR

```bash
cp <skill>/assets/modules/react-hook-form/standard.md <project>/docs/conventions/react-hook-form.md
cp <skill>/assets/modules/react-hook-form/adr.md <project>/docs/adr/0019-react-hook-form-for-forms.md
```

## 7. 之後的開發

- 新表單:`useForm<Request 型別>`,一個欄位一個 `FormField`,輸入元件以 `{(field) => <Input {...field} />}` 接
- 不再用 `Form.useForm` / `Form.Item name`;antd `Form` 只當版面容器(`layout`、`onFinish`)
- 細則見 `docs/conventions/react-hook-form.md`
