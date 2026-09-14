# 前端深色重訓風改版 + GSAP 捲動效果

**狀態**：已完成（archived）
**日期**：2026-09-14

## Why

[ADR 0001](../../../../docs/adr/0001-react-rewrite-for-portfolio.md) 決定把前端整個重寫成 React，但重寫完的第一版只是「功能對等、風格中性」——沿用 Tailwind 預設淺色系，跟「R Fitness」這個健身房品牌調性不符，也還沒套用深色重訓風的視覺設計。這份提案要把 7 個既有畫面換成深色重訓風的視覺語言，並接上 GSAP 捲動效果。

後端 API、`api/` 底下的檔案、`types/api.ts` 既有欄位維持不動——這是設計稿本身附帶的規則，也符合 ADR 0001「後端維持現狀不動」的既定方向。

## What Changes

- `RootLayout`：深色導覽列（logo + wordmark）、大頁尾（PLATFORM／會員／CONTACT 三欄）
- `HomeView`：主視覺、統計數據條、精選教練輪播、本週課程、方案卡片、會員見證（無 API 來源，標記 TODO）
- `CoachesView`：搜尋框 + 技能篩選 chips，全部前端過濾，不新增 API 參數
- `LoginView` / `SignupView`：改成獨立的左右分割版面，脫離 `RootLayout` 的導覽列／頁尾（跟設計稿一致，也是唯一的路由結構變更）
- `user/DashboardView`：新增週曆／月曆／清單三種檢視切換，資料同一份 `GET /users/courses`
- `user/BecomeCoachView`：3 步驟指示器 + 表單
- `coach/ProfileView`：左表單、右即時預覽卡片
- 報名成功的 SweetAlert 彈窗換成深色卡片樣式（設計稿規則，不是可選項）
- GSAP 捲動效果（`useScrollFx`）接進 `HomeView` 與 `CoachesView`：主視覺視差、數字 count-up、卡片分批浮現、方案卡捲動高亮、導覽列收放

## Impact

- Affected specs: `frontend-experience`（新建）
- Affected code: `frontend/src/components/`、`frontend/src/layouts/`、`frontend/src/pages/`、`frontend/src/hooks/useScrollFx.ts`、`frontend/src/hooks/useCourseActions.ts`
- 不受影響：`backend/`、`frontend/src/api/`、`frontend/src/types/api.ts`（欄位）
