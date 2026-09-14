# 公開頁接上真實資料（首頁／教練列表／教練詳細／健身方案）

**狀態**：已完成（archived）
**日期**：2026-09-11
**完整計畫**：[docs/superpowers/plans/2026-09-11-r-fitness-public-pages.md](../../../../docs/superpowers/plans/2026-09-11-r-fitness-public-pages.md)

## Why

骨架提案（`2026-09-11-frontend-foundation`）把路由跟登入接好了，但四個公開頁（`HomeView`／`CoachesView`／`CoachDetail`／`FitnessPlans`）還只是佔位文字。這份提案把它們接上真實 API 資料，並讓「報名課程」「購買方案」這兩個會員互動能真的動作。

## What Changes

- `HomeView`：主視覺、近期課程、熱門教練都改抓真實資料
- `CoachesView`：真實分頁教練列表（後端沒有總筆數欄位，用「上一頁/下一頁」而非頁碼）
- `CoachDetail`：真實教練檔案 + 開設課程 + 報名按鈕
- `FitnessPlans`：真實堂數方案 + 購買按鈕
- 新增 `useCourseActions`（報名，`HomeView`/`CoachDetail` 共用）、`usePackageActions`（購買）兩個 hook，統一「SweetAlert 確認 → 打 API → 顯示結果」的模式
- 新增 `extractErrorMessage`：把後端真實錯誤訊息（例如「已經報名過此課程」）顯示在彈窗，而不是通用訊息

## Impact

- Affected specs: `core-platform`
- Affected code: `frontend/src/pages/public/`、`frontend/src/hooks/`、`frontend/src/lib/errors.ts`、`frontend/src/lib/formatDateTime.ts`
- 不受影響：`backend/`
