# R Fitness

## 面試示範資料與部署

啟動資料庫並安裝後端依賴後，執行 `npm run seed:demo`，即可建立示範教練、會員、未來課程，以及今年 1 月至本月的歷史報名與營收資料。既有資料保留，同日重跑不會重複新增。

API 啟動後執行 `npm run verify:demo` 驗證每位教練的逐月報表。新建示範教練：`chen.jianhong@rfitness.tw`，示範會員：`demo.member1@example.com`，預設密碼皆為 `Demo12345`（既有帳號密碼不變）。

完整操作、資料口徑與 Render 前後端／PostgreSQL 部署設定：[面試示範與部署指南](docs/demo-and-deployment.md)。

一個讓會員購買堂數、預約課程，並讓教練管理課程與檢視月營收的全端健身課程平台。

**技術亮點：** 以 Node.js／Express／PostgreSQL 實作 RESTful API 與 JWT 授權；以 React／TypeScript 建構雙角色介面；以 Docker Compose、OpenAPI、Jest + Supertest contract tests 與 Playwright E2E 驗證交付品質。

## 功能一覽

| 使用者 | 可完成的流程 | 技術／商業規則 |
| --- | --- | --- |
| 訪客 | 瀏覽教練、課程與堂數方案 | 公開 API、分頁與角色導向頁面 |
| 會員（User） | 註冊登入、購買堂數、報名／取消課程、查看課表 | JWT、剩餘堂數即時計算、取消軟刪除 |
| 教練（Coach） | 維護個人檔案與技能、開設／修改課程、查看月營收 | 角色授權、課程所有權檢查、SQL 聚合、Recharts |

### 核心商業規則

- 報名會依序檢查：課程存在、是否曾報名、剩餘堂數與課程名額。
- 取消報名採軟刪除；紀錄保留，且堂數會由即時計算自動回補。
- 剩餘堂數不儲存於資料庫，公式為「購買總堂數 − 未取消報名數」。
- 教練營收排除取消報名，並依所有方案的平均單堂價格計算。

## 架構與技術棧

```text
React 19 + TypeScript + Vite
        │ Axios / JWT
        ▼
Node.js + Express 5 ── TypeORM ── PostgreSQL 16
        │
        ├── OpenAPI / Swagger UI
        ├── Jest + Supertest API contract tests
        └── Playwright E2E tests
```

| 區域 | 語言、框架與主要套件 |
| --- | --- |
| 前端 | TypeScript、React 19、Vite、React Router、Tailwind CSS 4、Axios、Recharts、GSAP、SweetAlert2、Day.js、jwt-decode |
| 後端 | JavaScript、Node.js 20、Express 5、TypeORM、pg、bcrypt、jsonwebtoken、CORS、dotenv |
| 資料庫／基礎設施 | PostgreSQL 16、Docker、Docker Compose、Swagger UI |
| 品質保證 | Jest、Supertest、Playwright、GitHub Actions、TypeScript 型別檢查 |

## 本機啟動

### 方式 A：完整 Docker 環境

需求：Docker Desktop。

```bash
docker compose up --build
```

| 服務 | 網址／連線資訊 |
| --- | --- |
| 前端 | http://localhost:3000 |
| 後端 API | http://localhost:8080 |
| Swagger UI | http://localhost:8081 |
| PostgreSQL | `localhost:5433`（容器內為 5432） |

停止服務使用 `docker compose down`。若需要重建資料庫，使用 `npm run db:reset`；這會移除 Docker volume 中既有資料。

### 方式 B：本機開發（前後端分開啟動）

需求：Node.js 20+、Docker Desktop。

```bash
# 終端機 1：只啟動資料庫與 API 文件
docker compose up -d postgres swagger

# 終端機 2：啟動後端
Copy-Item .env.example backend/.env
npm ci --prefix backend
npm --prefix backend run dev

# 終端機 3：啟動前端
Copy-Item frontend/.env.example frontend/.env
npm ci --prefix frontend
npm --prefix frontend run dev
```

`.env.example` 的 `DB_PORT=5433` 是給本機後端連 Docker PostgreSQL 使用；完整 Docker 環境的後端則使用容器內的 `DB_PORT=5432`。

## 測試與驗證

```bash
# 後端 API contract tests（需先啟動後端與 PostgreSQL）
npm test

# 前端型別檢查與 production build
npm --prefix frontend run build

# 前端端對端測試（需先啟動後端與 PostgreSQL）
npm --prefix frontend run test:e2e:types
npm --prefix frontend run test:e2e
```

GitHub Actions 在推送至 `main` 時會啟動 PostgreSQL、建置前後端，並執行前端型別檢查與 Playwright E2E。

## API 與存取控制

- OpenAPI 規格：[docs/openapi.yaml](docs/openapi.yaml)；完整 Docker 環境可在 Swagger UI 試打。
- 寫入會員資料、購買方案、報名與取消課程都需要 JWT。
- 教練後台、技能與方案管理需要 JWT 與 Coach 角色；教練只能讀寫自己的課程與資料。
- 升級教練使用 `POST /api/users/me/coach`，由登入 token 取得本人身分，不能指定或升級其他帳號。

## 專案文件

- [領域詞彙與關係](CONTEXT.md)：User、Coach、CourseBooking 等名詞與資料關係。
- [OpenAPI 規格](docs/openapi.yaml)：請求／回應格式與驗證規則。


