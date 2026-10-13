# Domain docs

Layout: single-context

## Glossary

- 位置:根目錄 `GLOSSARY.md`
- 格式:`## Language` 底下每個名詞一段——`**名詞**:` 換行一到兩句定義,可選 `_Avoid_:` 列不用的同義詞
- 只放詞彙,不放規格或實作決定
- 名詞一經決定就直接改 `GLOSSARY.md`,不累積到最後

## ADR

- 位置:`docs/adr/`,檔名 `NNNN-kebab-case-title.md`,編號接目前最大號(0001–0016 是團隊基線,不改;專案自己的從 0017 起)
- 格式:`# NNNN. 標題` → `## 背景` → `## 決策` → `## 後果`(含取捨與「何時重新討論」)。這比一段話的最小格式重,是團隊要求;
  短的決策照樣三節,每節一兩句即可
- 不留日期與歷史;被取代時在舊 ADR 開頭註明「已由 ADR-NNNN 取代」
- 偏離 `docs/conventions/` 或基線 ADR 的決定**一定**要寫 ADR,並連回被偏離的那份
- 什麼時候寫:難以回頭、沒有脈絡的讀者會驚訝、確實在幾個選項間取捨——三者皆是才寫;索引在 `docs/adr/README.md`
