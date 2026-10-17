# 0019. 表單狀態與驗證用 React Hook Form,antd 只負責版面與輸入元件

## 背景

既有專案的表單都用 React Hook Form;antd 自己也有一套 `Form.useForm()` + `Form.Item name/rules`。兩套各有完整
的狀態與驗證機制,混用時最常見的 bug 是「畫面顯示的值與送出的值不同」——一半欄位被 antd 管、一半被 React Hook
Form 管,`reset` 只重設其中一邊。

React Hook Form 的狀態是純 JS、不綁元件樹:跨步驟、跨對話框共用、在單元測試裡驗證規則都比較直接;型別直接用
`types/api/` 的 request 型別,欄位名打錯是編譯錯誤。antd 的強項是輸入元件與版面,不是狀態。

## 決策

**1. 表單狀態、驗證、送出一律 React Hook Form(`useForm`、`Controller`)(選了這個模組時;沒選的專案用 antd `Form`,見 ADR-0022)。** 不用 `Form.useForm()`、
不用 `Form.Item` 的 `name` 與 `rules`。

**2. antd 只負責外觀:`Form layout="vertical"` 當版面、`Input` / `Select` / `DatePicker` 當輸入元件。**

**3. 兩者由公版 `components/common/FormField` 接起來,一個欄位一個 `FormField`。** 它負責 label 與輸入元件的
關聯(`htmlFor` / `id`)、必填星號、錯誤訊息的位置;輸入元件由呼叫端以 render 函式提供,`field` 全部展開上去。

**4. `useForm<T>` 的 `T` 用 request 型別,一律給 `defaultValues`。** 表單形狀與 body 不同時才另宣告表單型別並在
送出前轉換。

**5. 驗證先用 `rules`,訊息引用字典;schema 函式庫(zod)暫不引入。** 既有專案若普遍用 zod,審查後再決定是否
升級為團隊預設(走 [tech-stack.md](../conventions/tech-stack.md) 第 2 節)。

✅

```tsx
const { control, handleSubmit } = useForm<CreateItemRequest>({ defaultValues: { name: '' } });
<FormField
  control={control}
  name="name"
  label={t.items.create.nameLabel}
  rules={{ required: t.items.create.nameRequired }}
>
  {(field) => <Input {...field} />}
</FormField>;
```

❌

```tsx
const [form] = Form.useForm<CreateItemRequest>();
<Form.Item name="name" rules={[{ required: true, message: t.items.create.nameRequired }]}>
  <Input />
</Form.Item>;
```

規則細節見 [`react-hook-form.md`](../conventions/react-hook-form.md)。

## 後果

- 所有表單的狀態機制只有一種;reviewer 看到 `Form.useForm` 就知道不對。
- 多一個執行期依賴 `react-hook-form`(約 10 KB gzip,進 `vendor` chunk)。
- antd `Form.Item` 的 `rules` 驗證、`dependencies`、`shouldUpdate` 這些功能不用;對應需求以 React Hook Form 的
  `validate`、`watch`、`useFieldArray` 實作。
- 這份決策目前只固定「狀態歸誰管、怎麼接 antd」;複雜欄位與 schema 驗證的團隊寫法待舊專案審查後補進
  `react-hook-form.md`。

### 何時重新討論

- 既有專案審查發現 zod schema 已是事實標準:改成 `zodResolver`,schema 與 `types/api/` 的關係要一併決定。
- antd 的輸入元件與 `Controller` 的 `field` 形狀出現大量轉接程式碼時,把常用的轉接做進 `FormField`。
