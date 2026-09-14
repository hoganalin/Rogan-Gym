# React 前端骨架（取代原本的 Vue 版本）

**狀態**：已完成（archived）
**日期**：2026-09-11
**完整計畫**：[docs/superpowers/plans/2026-09-11-r-fitness-frontend-foundation.md](../../../../docs/superpowers/plans/2026-09-11-r-fitness-frontend-foundation.md)

## Why

[ADR 0001](../../../../docs/adr/0001-react-rewrite-for-portfolio.md) 決定把前端整個換成 React（取代原本的 Vue 3 版本），補齊「獨立完成一個當代前端框架作品、前後端皆有實作經驗」這塊作品集缺口。這是整個重寫系列的第一份提案：先把「能跑、能登入、能依角色導航」的骨架建好，畫面內容留給後續各分區的提案處理，避免一次提案範圍過大。

## What Changes

- 用 Vite + React 19 + TypeScript + Tailwind CSS v4 重新 scaffold `frontend/`，完全取代 Vue 版本
- 幫後端每一個 endpoint 寫一支型別化的 API client（`src/api/*.ts` + `src/types/api.ts`），型別直接從 `backend/controllers/` 的實際回應讀出來，不是憑 OpenAPI 文件猜的
- 搬過去 Vue 版沿用的 cookie-based JWT 慣例（`token` cookie、`Authorization: Bearer`），`AuthContext` 解 JWT 拿 role/name，`ProtectedRoute` 做角色守門
- 14 條路由全部接好、依角色分到 `RootLayout`／`UserLayout`／`CoachLayout`，畫面先用最小佔位內容
- 把原本 Vue 前端 `/admin/*` 路徑下的兩個功能（升級教練、技能維護）依 `CONTEXT.md` 已解決的「沒有獨立 Admin 角色」結論，正確歸類到 `/user/become-coach`（USER）與 `/coach/skills`（COACH）
- 順手清掉 README、`package.json` description 裡殘留的舊環境命名

## Impact

- Affected specs: `core-platform`（新建，見本次提案同批的 spec）
- Affected code: 整個 `frontend/` 目錄（新建）
- 不受影響：`backend/`
