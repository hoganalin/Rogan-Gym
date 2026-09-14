# Tasks

完整逐步任務見計畫文件本身；這裡是回填的驗收層級清單。

- [x] Vite + React + TypeScript + Tailwind v4 專案骨架，`Dockerfile`／`.env.example` 沿用既有慣例
- [x] `lib/request.ts`：axios instance + `ROUTE_TABLE`（哪些請求不用帶 token），從 Vue 版本的邏輯移植過來
- [x] `types/api.ts` + `api/*.ts`：對照 `backend/controllers/` 實際程式碼（不是文件）逐一核對回應形狀
- [x] `context/AuthContext.tsx` + `components/ProtectedRoute.tsx`：JWT 解碼、角色守門
- [x] `App.tsx`：14 條路由全部接上，依角色套對應 Layout
- [x] 兩個「/admin」功能重新歸類到 `/user/become-coach`、`/coach/skills`，`CONTEXT.md` 的既有疑點標記為已解決
- [x] 清掉 README／`package.json` 殘留的舊環境命名
- [x] `npm run build`（TypeScript + Vite build）通過
