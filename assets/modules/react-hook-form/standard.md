# 表單(模組:react-hook-form)

> 選了 react-hook-form 模組才有這份規範(`docs/adr/0022-selected-modules.md`)。表單狀態與驗證一律用 React Hook Form,antd 只負責版面與輸入元件,兩者由骨架的 `components/common/FormField`
> 接起來。決策理由見 [ADR-0019](../adr/0019-react-hook-form-for-forms.md)。
> 範本:`src/components/items/ItemCreateDialog.tsx`(骨架的範例功能)。
>
> **狀態:初版。** 驗證 schema(是否引入 zod)、複雜欄位(動態列、巢狀物件、檔案上傳)與既有專案的實際用法,
> 待舊專案審查後補上;本檔標「待補」的段落就是缺口。

## 1. 分工:React Hook Form 管狀態,antd 管外觀

**規則:**

| 事情                                | 誰負責                                                           |
| ----------------------------------- | ---------------------------------------------------------------- |
| 欄位值、dirty / touched、驗證、送出 | React Hook Form(`useForm`、`Controller`)                         |
| 版面(label、說明、錯誤訊息的位置)   | antd `Form`(`layout="vertical"`)+ `Form.Item`(由 `FormField` 包) |
| 輸入元件                            | antd `Input`、`Select`、`DatePicker`…                            |

不用 antd `Form.useForm()`、`Form.Item` 的 `name` / `rules`;一個表單裡只有一套狀態機制。

**原因:** antd Form 的狀態綁在它的元件樹,跨步驟、跨對話框共用狀態與測試都不方便;React Hook Form 的狀態是
純 JS,型別來自 `types/api/` 的 request 型別,驗證規則可以單元測試。兩套同時用會出現「畫面顯示的值與送出的值
不同」的 bug。

## 2. 一個欄位一個 `FormField`

**規則:** 每個欄位用 `<FormField control name label rules>{(field) => <Input {...field} />}</FormField>`。
`FormField` 把 React Hook Form 的 `field`(value、onChange、onBlur、ref)加上 antd 需要的 `id` 與 `status`
交給輸入元件,錯誤訊息顯示在 `Form.Item` 的 `help`,label 以 `htmlFor` 對到輸入元件。

**原因:** label 與輸入元件的關聯、錯誤的顯示位置、必填星號只寫一次;螢幕閱讀器與測試的 `getByLabelText`
都靠這個關聯。

✅ 正確(取自 `src/components/items/ItemCreateDialog.tsx`)

```tsx
const { control, handleSubmit, reset } = useForm<CreateItemRequest>({ defaultValues: { name: '' } });

<Form layout="vertical" onFinish={() => void submit()}>
  <FormField
    control={control}
    name="name"
    label={t.items.create.nameLabel}
    rules={{
      required: t.items.create.nameRequired,
      validate: (value) => value.trim() !== '' || t.items.create.nameRequired,
    }}
  >
    {(field) => <Input {...field} autoFocus />}
  </FormField>
</Form>;
```

❌ 錯誤

```tsx
<Form.Item name="name" rules={[{ required: true, message: '請輸入名稱' }]}>  {/* antd 的狀態與驗證、文案寫死 */}
  <Input />
</Form.Item>
<Input value={name} onChange={(e) => setName(e.target.value)} />            {/* 自己用 useState 管表單 */}
```

輸入元件的 `onChange` 形狀與 `field.onChange` 不合時(例如 `Checkbox` 給 event、`Upload` 給檔案清單),在
render 函式裡轉:`{(field) => <Checkbox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}`。

## 3. 型別與預設值

**規則:**

- `useForm<T>()` 的 `T` 用 `types/api/` 的 **request 型別**(`CreateItemRequest`),不另造表單專用型別;
  表單欄位與送出的 body 不同形時才在元件裡宣告 `interface XxxFormValues` 並在送出前轉換。
- 一律給 `defaultValues`,每個欄位都有初始值(`''`、`[]`、`null`);沒有預設值的欄位第一次 `onChange` 會從
  `undefined` 變成有值,React 會警告 uncontrolled → controlled。
- 編輯表單的 `defaultValues` 來自 `useSuspenseQuery` 的資料;資料更新後要重設表單用 `reset(data)`,或給元件
  `key={data.id}` 讓它重掛。

## 4. 驗證

**規則:**

- 用 `rules`(`required`、`minLength`、`pattern`、`validate`)寫驗證;訊息選了 i18n 時引用字典
  (`i18n.md`),沒選直接寫繁中。
- 必填的文字欄位加 `validate: (value) => value.trim() !== '' || 訊息`,空白不算有填。
- 跨欄位驗證(結束日期不早於開始日期)用 `validate` 的第二個參數讀其他欄位的值。
- 後端回 `VALIDATION_FAILED` 時由 `useActionMutation` 的 toast 回報;要把後端的欄位錯誤標在欄位上,用
  `setError(name, { message })`,並在呼叫端註解寫理由([error-handling.md](./error-handling.md))。
- 驗證 schema 函式庫(zod + `@hookform/resolvers`)目前**不引入**;需要時走 [tech-stack.md](./tech-stack.md)
  第 2 節,通過後更新本檔(見第 7 節)。

## 5. 送出

**規則:**

- 送出函式寫成 `const submit = handleSubmit(async (values) => { … })`,放在元件內部宣告順序的「衍生值與事件
  處理函式」區([components.md](./components.md) 第 5 節)。
- 寫入用 mutation 的 `mutateAsync`,成功後 `reset()` 並關閉;失敗時 `catch` 後 `return`,**保留使用者輸入**
  (toast 已由 `useActionMutation` 處理,見 [ADR-0015](../adr/0015-optimistic-updates-and-races.md))。
- 對話框:`Modal` 的 `onOk={() => void submit()}`、`confirmLoading={mutation.isPending}`;`Form` 的
  `onFinish={() => void submit()}` 讓 Enter 也能送出;取消時 `reset()` 再關閉。
- 頁面表單:送出按鈕 `htmlType="submit"`、`loading={mutation.isPending}`。

## 6. 測試

- 用 `getByLabelText(<label 文字>)` 找欄位(選了 i18n 時引用字典)、`user.type` 輸入、`getByRole('button', { name })` 送出,斷言結果
  出現在畫面上(範本:`ItemsPage.test.tsx` 的 `creates an item`)。
- 驗證訊息用 `findByText(<訊息>)` 斷言(非同步,驗證在 submit 後才顯示)。
- 不測 React Hook Form 的內部狀態(`formState`、`getValues`)。

## 7. 待補(舊專案審查後填)

- 是否統一用 zod schema + `@hookform/resolvers` 取代 `rules`;若是,schema 放哪一層、與 `types/api/` 的關係
- 動態列(`useFieldArray`)、巢狀物件、`Select` 選項來自 API、`Upload` 的範本
- 多步驟表單、草稿暫存、離開頁面前的「尚未儲存」提示
- 唯讀 / 檢視模式與編輯模式共用同一個表單的寫法
- 既有專案的欄位版面規則(label 寬度、兩欄排版、對話框內的表單寬度)
