# 教練後台接上真實資料（技能標籤／個人檔案／課程管理／營收報表）

**狀態**：已完成（archived）
**日期**：2026-09-12
**完整計畫**：[docs/superpowers/plans/2026-09-12-r-fitness-coach-area.md](../../../../docs/superpowers/plans/2026-09-12-r-fitness-coach-area.md)

## Why

React 重寫系列裡最後一組未完成的路由。把四個 `/coach/*` 頁面接上真實資料，完成 ADR 0001 承諾的「14 條路由全部重寫」。

## What Changes

- `SkillTagsView`：技能標籤 CRUD（技能是全站共用，不是每個教練各自的，後端本身沒有做 ownership 範圍限制——這是既有後端的簡化設計，前端不用假裝有）
- `ProfileView`：編輯教練檔案 + 選技能。`profile_image_url` 後端要求非空且 `https` 開頭，即使剛升級的教練該欄位是 `null`，所以表單把這欄設 `required`
- `CoursesView`：課程列表／新增／編輯。後端沒有刪除課程的 endpoint，前端沒有「刪除」按鈕；`PUT` 是整批覆蓋不是部分更新，編輯表單要先把 `GET` 回來的完整資料填好
- `EarningsView`：月份選單 + Recharts 長條圖。月份參數要英文小寫月份名，且後端只能查「伺服器目前這一年」，沒有年份參數
- 修一個後端 bug：`putCoach`（教練存檔）沒有真的把純量欄位寫回資料庫（commit `6e2f67c`）——這是這批提案裡唯一動到 `backend/` 的地方，且是修正既有錯誤行為，不是新功能

## Impact

- Affected specs: `core-platform`
- Affected code: `frontend/src/pages/coach/`
- 這批例外地也動了 `backend/controllers/coach.js`（修 bug，見上）
