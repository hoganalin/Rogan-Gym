# Tasks

- [x] `SkillTagsView` 接上真實技能 CRUD
- [x] `ProfileView` 接上真實檔案編輯 + 技能勾選，`profile_image_url` 設為必填
- [x] `CoursesView` 接上真實列表／新增／編輯（無刪除，`PUT` 整批覆蓋前先完整預填）
- [x] `EarningsView` 接上月份選單 + Recharts 月營收長條圖
- [x] **抓到並修好後端 bug**：`putCoach` 存檔時純量欄位（`experience_years`／`description`／`profile_image_url`）沒有真的寫回資料庫，重新整理後看起來像沒存到（commit `6e2f67c`）
- [x] `npm run build` 通過
