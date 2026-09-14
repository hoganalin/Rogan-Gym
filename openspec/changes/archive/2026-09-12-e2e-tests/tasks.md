# Tasks

- [x] `playwright.config.ts` + `api-helpers.ts`（自帶時間戳記 fixture，不依賴資料庫現況）
- [x] `member-journey.spec.ts`：註冊→登入→購買方案→（在教練自己的詳細頁，不是首頁，避免首頁課程列表被其他資料擠掉的 flaky 問題）報名→課表確認
- [x] `coach-journey.spec.ts`：技能→檔案（含重新整理驗證真的寫進 DB）→課程建立/編輯→營收頁
- [x] 修正 Playwright 的 webServer 沒有明確綁定 `127.0.0.1` 的問題
- [x] `npm run test:e2e:types`（型別檢查 e2e/ 底下的測試程式）+ `npm run test:e2e` 通過

> 這套測試在後續 [2026-09-14-dark-gym-redesign](../2026-09-14-dark-gym-redesign/) 改版時真的抓到了 8 個迴歸——證明「先寫測試」這個決定是對的，不是走個形式。
