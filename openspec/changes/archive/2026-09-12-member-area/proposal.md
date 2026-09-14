# 會員區接上真實資料（課表／個人資料／購買紀錄／成為教練）

**狀態**：已完成（archived）
**日期**：2026-09-12
**完整計畫**：[docs/superpowers/plans/2026-09-12-r-fitness-member-area.md](../../../../docs/superpowers/plans/2026-09-12-r-fitness-member-area.md)

## Why

延續公開頁提案的慣例，把登入後的四個 `/user/*` 頁面（`DashboardView`／`ProfileView`／`OrdersView`／`BecomeCoachView`）從佔位文字換成真實資料與互動。

## What Changes

- `DashboardView`：真實報名清單 + 取消報名（擴充既有的 `useCourseActions`，不另開新 hook）
- `ProfileView`：改暱稱、改密碼
- `OrdersView`：真實購買紀錄（後端沒有 id 欄位，用陣列索引當 React key，是接受的限制不是要修的 bug）
- `BecomeCoachView`：真實升級教練表單。**關鍵行為**：升級成功後目前的 session JWT 裡的 role 仍是舊的（token 簽發時就固定了），所以升級後直接登出、導去 `/login`，讓下一次登入拿到帶新 role 的新 token——不在前端「假裝」把 `user.role` 偷偷改掉
- `AuthContext` 的 `AuthUser` 型別補上 `id`（become-coach 的 API 需要）

## Impact

- Affected specs: `core-platform`
- Affected code: `frontend/src/pages/user/`、`frontend/src/context/AuthContext.tsx`、`frontend/src/types/api.ts`、`frontend/src/hooks/useCourseActions.ts`
- 不受影響：`backend/`
