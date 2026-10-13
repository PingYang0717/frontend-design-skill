# 0015. 樂觀更新與競態的正確性原則

## 背景

寫入之後到伺服器回應之前,畫面要不要先變?先變(樂觀更新)讓介面感覺快,但它引入了三類
不會在 happy path 測試中出現的 bug:

- **回滾不完整**:失敗時快取已被改過,使用者看到的是一筆不存在的資料,或自己輸入的東西
  連同錯誤一起消失。
- **晚到的回應蓋掉新的狀態**:使用者已經切到 B,A 的回應才回來,寫到 B 身上。
- **判斷「落地了沒」的條件錯誤**:用內容比對判斷重抓是否已帶回資料,遇到兩筆相同內容就誤判。

這些修正看起來都像可以「順手簡化」的地方,而每一次簡化都會把 bug 放回去。

## 決策

### default-is-invalidate:預設不做樂觀更新

寫入成功後 `invalidateQueries` 對應的 key,讓快取重抓
([ADR-0005](0005-suspense-query-and-data-boundary.md))。骨架的 `useCreateItem` /
`useDeleteItem` 就是這樣。只有回應延遲明顯影響操作手感(例如切換、排序、釘選)時才做樂觀
更新,並在 hook 註解寫理由。

### rollback-with-snapshot:樂觀更新要能完整回滾

- `onMutate` 先 `cancelQueries`(避免進行中的重抓蓋掉樂觀值),再取快照、寫入樂觀值,把
  快照回傳成 context。
- `onError` 用快照還原;`onSettled` 一律 invalidate,讓快取回到伺服器的事實。
- 合併部分回應時,**缺的欄位不能以 `undefined` 覆蓋快取**。

### scoped-by-id:非同步結果只寫回它所屬的對象

非同步結果(mutation 回應、計時器、輪詢)帶著它屬於哪個 id,寫回時只動那一份。不寫「目前
選取的那一個」——結果回來時,目前選取的可能已經換了。

### compare-by-identity-not-content:判斷落地用身分或長度,不用內容

判斷「重抓是否已帶回這筆資料」時,比 id、版本或清單長度,不比最後一筆的文字。兩筆相同
內容的資料會讓內容比對誤判。

### keep-user-input-on-failure:失敗時保留使用者輸入

寫入失敗時,表單內容、對話框與草稿都留著;使用者修正後可以重送。`ItemCreateDialog` 只在
`mutateAsync` 成功後才 `resetFields` 與關閉。

✅

```ts
useActionMutation({
  mutationFn: deleteItem,
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: itemsQueryKey, exact: true });
  },
});
```

```tsx
const submit = async () => {
  const values = await form.validateFields();
  await createItem.mutateAsync(values); // 失敗會拋出,下面兩行不會執行
  form.resetFields();
  onClose();
};
```

❌

```ts
onMutate: (id) => {
  queryClient.setQueryData(itemsQueryKey, (old) => old?.filter((item) => item.id !== id));
  // 沒有 cancelQueries、沒有快照,失敗時無從回滾
},
```

```ts
const isLanded = history.at(-1)?.text === pendingText; // 內容比對,連送兩次相同內容就誤判
```

規則細節見 [`state-management.md`](../conventions/state-management.md)、
[`data-fetching.md`](../conventions/data-fetching.md)。

## 後果

- 預設 invalidate 讓大部分寫入簡單且正確,代價是寫入後會有一次重抓的延遲。
- 每個樂觀更新都要有測試涵蓋失敗回滾與競態情境(例如連續兩次相同操作、回應晚到),
  不只 happy path。
- 程式碼註解以 `(ADR-0015 §<小節名>)` 引用這些原則,讓「看起來可以簡化」的地方有出處。

### 何時重新討論

- 專案出現大量需要即時手感的互動(拖曳排序、協同編輯)時,評估更完整的方案
  (版本號、伺服器推播),並另寫 ADR。
- 專案自己修過的競態 bug,把約定寫進專案 ADR 並在這裡的小節格式下新增,不要只留在 commit
  訊息裡。
