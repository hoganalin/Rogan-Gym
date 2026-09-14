# 第一套真正提交的 Playwright E2E 測試

**狀態**：已完成（archived）
**日期**：2026-09-12
**完整計畫**：[docs/superpowers/plans/2026-09-12-r-fitness-e2e-tests.md](../../../../docs/superpowers/plans/2026-09-12-r-fitness-e2e-tests.md)

## Why

[ADR 0001](../../../../docs/adr/0001-react-rewrite-for-portfolio.md) 承諾至少涵蓋一條會員關鍵路徑，但在此之前每份計畫的「手動驗證」步驟都只是跑一次即丟的暫時腳本，從沒有真的提交成 `*.spec.ts`。這份提案把它變成版本控制內、可重複執行的測試，並依需求把範圍從 ADR 原本只承諾的會員路徑，擴大到教練路徑（技能→檔案→課程建立/編輯→營收），這是超出 ADR 原始範圍的決定，在此明記而非默默假設。

## What Changes

- `frontend/playwright.config.ts` + `frontend/e2e/api-helpers.ts`：測試對真實後端／真實 Postgres 跑，不 mock；每個 spec 用 `beforeAll` 透過真實 API 自己造專屬、帶時間戳記的 fixture 資料，不依賴資料庫目前狀態
- `member-journey.spec.ts`：註冊 → 購買堂數 → 報名課程 → 課表看得到
- `coach-journey.spec.ts`：技能標籤 → 個人檔案（含重新整理驗證有真的寫進資料庫，不是只看 PUT 的回應）→ 課程建立/編輯 → 營收頁

## Impact

- Affected specs: 新建 `openspec/changes` 底下沒有獨立 spec 檔（測試套件本身不是使用者可見能力），但約束了後續所有 UI 改動不能破壞這兩條路徑
- Affected code: `frontend/playwright.config.ts`、`frontend/e2e/`
- 不受影響：`backend/`
