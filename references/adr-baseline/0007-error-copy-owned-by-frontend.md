# 0007. 錯誤文案由前端擁有,依後端 `code` 查對照表

## 背景

後端的錯誤回應是 `{ code, message }`。`message` 實際長成的樣子多半是
`duplicate key error ... index: name_1`、`NullPointerException at ItemService.java:214`——
用伺服器日誌的語彙描述失敗。那是給維運看的,不是給按下「新增」的使用者看的;它也只有一種
語言,而且後端換個措辭,畫面就跟著變。

## 決策

**1. `code` 決定文案,不是 `message`。** 對照表在 `utils/describeError.ts` 的 `ERROR_COPY_BY_CODE`
(選了 i18n 模組時改在字典的 `errors.byCode`,`i18n/zhTW.ts` 與 `en.ts` 各一份),
key 用線路上的 code 原樣(SCREAMING_CASE,[ADR-0003](0003-dto-matches-backend-contract.md)),
值是前端自己寫的句子。

**2. 已知 code 只列在一處。** `types/api/error.ts` 的 `KNOWN_ERROR_CODES`;對照表的型別是
`Record<KnownErrorCode, string>`,漏寫是 typecheck 錯誤。選了 i18n 時,
`i18n/errorCodeCoverage.test.ts` 再逐條確認每種語言都有文案。

**3. 未知 code:泛用文案為主,後端原話降為技術細節。**

- **讀取失敗(錯誤卡)**:`describeLoadError` 回傳 heading + detail 兩層,後端原話放第三層
  `technical`,`LoadErrorPanel` 把它收在可展開的「技術細節」裡。
- **寫入失敗(toast)**:只有一行,那一行只放我們的文案(`describeActionError`);未知
  code 時說「操作失敗」,有 HTTP 狀態就帶上狀態碼。

**4. 狀態類的錯誤不靠 code。** 斷線、404、403 由 `apiError.ts` 判讀
([ADR-0006](0006-api-errors-judged-in-one-place.md)),文案帶上呼叫端傳入的 `what`
(「找不到這筆項目」),因為「是哪個東西」只有發出請求的地方知道。

**5. 對照表只管文案,不管呈現位置。** toast、錯誤卡還是表單內提示,由呼叫端決定;把兩件事
塞進同一張表會讓它同時決定文字與流程。

✅

```ts
// src/types/api/error.ts
export const KNOWN_ERROR_CODES = ['VALIDATION_FAILED', 'CONFLICT'] as const;
```

```ts
// src/utils/describeError.ts(選了 i18n 時是 zhTW.ts 的 errors.byCode)
const ERROR_COPY_BY_CODE: Record<KnownErrorCode, string> = {
  VALIDATION_FAILED: '輸入的資料不正確,請檢查後再送出。',
  CONFLICT: '資料已被其他人修改,請重新整理後再試。',
};
```

❌

```ts
// 後端原話直接當主文案
message.error(errorMessage(error));
```

```tsx
// 在元件裡逐 code 寫死句子
if (errorCode(error) === 'CONFLICT') message.error('有人改過了');
```

新增一個 code 的步驟:`KNOWN_ERROR_CODES` 加一個 → 對照表加一句(漏寫 typecheck 失敗)。
規則細節見 [`error-handling.md`](../conventions/error-handling.md)。

## 後果

- 使用者看到的錯誤句子都是可行動的,不會因後端換措辭而變動;選了 i18n 時還是雙語的(ADR-0010)。
- **對照表會落後於後端。** 後端新增的 code 在前端補上之前,落到泛用文案;不會擋住使用者,
  但句子比較模糊。新 code 應隨 API 契約一起通知前端。
- 後端原話仍可在錯誤卡的技術細節裡找到,回報問題時不會遺失資訊。

### 何時重新討論

- 後端開始提供多語系、面向使用者的 message 時,可考慮在已知 code 之外改用它當泛用文案。
- 某類錯誤需要整個畫面的引導(例如帳號層級的拒絕)而不只一句話時,為它另寫 ADR,
  不要塞進 `byCode`。
