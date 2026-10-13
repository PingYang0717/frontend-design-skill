# {{FEATURE_NAME}} 規格

| 項目           | 內容                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| 編號前綴       | {{SPEC_PREFIX}}(scenario 依序編號:{{SPEC_PREFIX}}-001、{{SPEC_PREFIX}}-002…,刪除的編號不重用) |
| 對應 prototype | {{PROTOTYPE_VERSION}} 的 <!-- FILL: 畫面名稱 / 區塊 -->                                       |
| 路由           | <!-- FILL: 路徑,與 src/constants/routes.ts 一致 -->                                           |
| 需要的權限     | <!-- FILL: 權限代碼,與 src/constants/permissions.ts 一致;不需要就寫「無」 -->                 |
| 相關 API       | <!-- FILL: 連到 docs/api/ 的端點 -->                                                          |

## 目標

<!-- FILL: 使用者為什麼需要這個功能,1–3 句。名詞一律用 CONTEXT.md 的詞。 -->

## 畫面與版面

<!-- FILL: 這個功能的畫面組成(由上而下、由左而右),每個區塊對應哪個元件(沿用 docs/_bootstrap/prototype-analysis.md 的元件對映:antd 直接用 / 共用元件 / 自製)。只寫 agent 需要知道的版面、間距、顯示規則;顏色寫 token 名稱,不寫色碼。 -->

## 資料

<!-- FILL: 這個畫面顯示與送出的欄位:欄位名(與 DTO 一致)、顯示方式、格式(日期、數字、空值顯示)、排序與篩選規則。 -->

## 行為規格

Gherkin 關鍵字用英文,內容用繁體中文。每個 scenario 一個編號,測試名稱帶這個編號。
**必須包含 prototype 沒畫到的狀態**:載入中、空資料、讀取失敗、寫入失敗、權限不足、長文字、大量資料。

```gherkin
Feature: {{FEATURE_NAME}}

  Background:
    Given <!-- FILL: 共同前提,例如「使用者已登入並具有 items:read 權限」 -->

  # {{SPEC_PREFIX}}-001
  Scenario: <!-- FILL: 快樂路徑 -->
    Given <!-- FILL -->
    When <!-- FILL -->
    Then <!-- FILL -->

  # {{SPEC_PREFIX}}-002
  Scenario: 清單為空時顯示空狀態
    Given <!-- FILL -->
    When <!-- FILL -->
    Then <!-- FILL -->

  # {{SPEC_PREFIX}}-003
  Scenario: 讀取失敗時顯示錯誤卡與重試
    Given 後端回應錯誤
    When 使用者進入頁面
    Then 顯示錯誤卡與「重試」按鈕
    And 按下重試後重新讀取

  # {{SPEC_PREFIX}}-004
  Scenario: 沒有權限的使用者看不到寫入操作
    Given <!-- FILL -->
    Then <!-- FILL -->
```

## 偏離紀錄

實作時發現 prototype 行不通或需要調整,先記在這裡並回報 UX,不要默默改掉。

| prototype 版本 | 位置 | prototype 的樣子 | 實作的樣子 | 原因 | UX 確認 |
| -------------- | ---- | ---------------- | ---------- | ---- | ------- |

## 待確認

<!-- FILL: 這個功能還沒有答案的問題;沒有就寫「無」。 -->
