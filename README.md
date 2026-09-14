# R Fitness

健身房課程預約平台。會員可以瀏覽教練、購買堂數方案、報名課程；教練可以維護個人檔案、開設課程、查看月營收統計。

## 技術棧

- **後端**：Node.js、Express、TypeORM、PostgreSQL、JWT 驗證
- **前端**：React、TypeScript、Vite、Tailwind CSS、Recharts
- **測試**：Jest + Supertest（後端 API contract tests）、Playwright（前端 E2E）
- **容器化**：Docker Compose（frontend / backend / postgres / swagger）

## 本機啟動

1. 安裝 [Docker Desktop](https://www.docker.com/products/docker-desktop/)，並確認 Node.js 版本 >= 20
2. `docker compose up -d` 啟動前端（`http://localhost:3000`）、Swagger 文件（`http://localhost:8081`）、PostgreSQL（`localhost:5433`，對應容器內部的 5432）
3. 進入 `backend/`，複製 `.env.example` 為 `.env`，執行 `npm install` 後 `npm run dev`，後端會跑在 `http://localhost:8080`

## 測試

```bash
npm test              # 全部後端 contract tests
npm run test:m1       # 分模組測試（m1 ~ m6）
```

前端 E2E（需要後端與 PostgreSQL 已啟動，見上方「本機啟動」）：

```bash
cd frontend && npm run test:e2e         # 執行 E2E 測試（Playwright 會自動啟動前端 dev server）
cd frontend && npm run test:e2e:types   # 型別檢查 e2e/ 底下的測試程式（npm run test:e2e 本身不會做型別檢查）
```

## AI 輔助開發

前端的深色重訓風改版（`RootLayout`／`HomeView`／`CoachesView`／登入註冊／會員課表／教練後台等 7 個畫面）、GSAP 捲動效果整合、demo 資料建置，都是用 Claude Code 完成的。實際用在哪些環節、怎麼驗證：

- **改版與整合**：對照設計稿逐畫面重寫，接上 `GET /coaches` 之外還要再打 `GET /coaches/:id` 才能組出卡片資料的前端邏輯、GSAP `ScrollTrigger` 動畫
- **抓 bug**：追出 React StrictMode 開發模式下 GSAP count-up 動畫「讀到自己動畫過程中的中間值當目標值」而卡在 0 的問題；追出改版意外讓既有 Playwright 測試依賴的 DOM 結構（`<h3>` 標題、真的 `<input type="checkbox">`、SweetAlert 的 `.swal2-title`）跟著跑掉
- **驗證方式，不是只看 AI 說「完成了」**：
  - `npm run build`（TypeScript 型別檢查 + Vite build）每個畫面完成後都跑一次
  - `npx playwright test` 實際重跑既有 E2E 測試，抓到上面那些跟改版衝突的地方並修好，而不是憑印象猜測沒事
  - `npm test`（根目錄的黑箱合約測試，`test/m1~m6` + `smoke`，共 68 項）確認改版與資料庫清理沒有破壞任何既有的自動化測試
  - Playwright 截圖 + `prefers-reduced-motion` 模擬，逐項比對設計稿與無障礙行為
  - 直接查詢資料庫（`psql`）核對 demo 種子資料與 API 回應一致

**工作流程**：改版與資料整理過程採用規格驅動開發（Spec-Driven Development，對應 [Spectra](https://spectra.5xcamp.us/) / [OpenSpec](https://github.com/Fission-AI/OpenSpec) 慣例）——先寫 proposal（為什麼改、改了什麼）、列出 tasks checklist（含驗證方式），完成後封存並回填成能力規格，取代單純的 commit message 敘述。實際規格見 [`openspec/`](openspec/)，範例變更：[`openspec/changes/archive/2026-09-14-dark-gym-redesign/`](openspec/changes/archive/2026-09-14-dark-gym-redesign/)。

延伸：教練後台的月營收頁（`coach/EarningsView`）用 Recharts 畫月營收長條圖、依月份查看營收／參與人次／報名數明細，是這個專案裡最接近「資料視覺化／基礎統計」的部分；沒有 Kubernetes 部署經驗，目前只到 Docker Compose（`backend`／`frontend`／`postgres`／`swagger` 四個服務）。

## 專案文件

- 領域詞彙與關係：[CONTEXT.md](CONTEXT.md)
- 架構決策紀錄：[docs/adr/](docs/adr/)
- API 規格：[docs/openapi.yaml](docs/openapi.yaml)（Swagger UI：`http://localhost:8081`）
- 規格驅動開發的變更紀錄：[openspec/](openspec/)
