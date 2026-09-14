# 前端 CI、以及把舊環境殘留用語從 repo 裡清乾淨

**狀態**：已完成（archived）
**日期**：2026-09-13

## Why

在此之前 CI 只跑後端（`test.yml`），前端完全沒有自動化檢查——E2E 測試套件（`2026-09-12-e2e-tests`）已經存在，卻沒有任何 workflow 去執行它，等於白寫。同時，repo 轉型成求職作品集後（ADR 0001），`backend/`、`docs/openapi.yaml`、測試檔案的註解裡還留著舊環境的命名習慣，會讓看 repo 的人以為這還是練習用的專案。

## What Changes

- 新增 `.github/workflows/frontend.yml`：開 Postgres + 真實後端（跟既有 `test.yml` 一樣的環境變數模式），跑前端的 `tsc -b`、`vite build`、Playwright E2E
- 修 `frontend/tsconfig.e2e.json` 缺少明確 `typeRoots` 的問題——本機開發時型別檢查「意外」正確，只是因為 monorepo 根目錄的 `node_modules` 剛好在路徑上；CI 只裝 `backend/`／`frontend/` 各自的依賴，沒有根目錄那份，型別檢查因此在 CI 裡才會真的破功
- 把 `backend/`、測試檔案註解、`docs/openapi.yaml` 標題、`.github/workflows/test.yml` 名稱裡的舊環境用語，改寫成中性的產品/API 文件語氣
- `package.json` 專案名稱從 `fitness-backend-final` 改成 `r-fitness`

## Impact

- Affected specs: 無使用者可見行為變更
- Affected code: `.github/workflows/frontend.yml`（新建）、`frontend/tsconfig.e2e.json`、`backend/` 註解、`docs/openapi.yaml`、`package.json`
