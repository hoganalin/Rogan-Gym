# Tasks

- [x] `package.json` 專案名稱 `fitness-backend-final` → `r-fitness`
- [x] 清掉 `backend/`、測試檔案裡殘留的舊環境用語（保留邏輯與註解本身的技術內容，只改用語）
- [x] 重寫 `docs/openapi.yaml` 標題與描述成中性 API 文件語氣
- [x] 確認 `.github/workflows/test.yml` 名稱裡沒有殘留舊環境命名
- [x] 新增 `.github/workflows/frontend.yml`：Postgres + 後端 + 前端 `tsc -b` / `vite build` / Playwright E2E
- [x] **抓到並修好一個 CI 才會炸的問題**：`tsconfig.e2e.json` 沒有明確 `typeRoots`，本機因為 monorepo 根目錄 `node_modules` 剛好在路徑上而「意外正確」；CI 只裝 `backend/`／`frontend/` 各自依賴，同一份設定在 CI 裡型別檢查會找不到型別定義而失敗 → 補上明確 `typeRoots`，讓型別檢查真正自我完備
