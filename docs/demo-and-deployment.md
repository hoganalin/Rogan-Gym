# 面試示範資料與公開部署

## 本機重建示範資料

需要 Node.js 20+、Docker Desktop。從專案根目錄執行：

```powershell
docker compose up -d postgres swagger
npm ci --prefix backend
# 僅在 backend/.env 不存在時複製，避免覆蓋自己的設定
if (!(Test-Path backend/.env)) { Copy-Item .env.example backend/.env }
npm run seed:demo
npm --prefix backend run dev
```

另一個終端機：

```powershell
npm ci --prefix frontend
if (!(Test-Path frontend/.env)) { Copy-Item frontend/.env.example frontend/.env }
npm --prefix frontend run dev
```

啟動 API 後執行 `npm run verify:demo`，逐一比對每位教練 1 月至本月的資料庫統計與營收 API，並檢查未來課程及會員剩餘堂數。

### 資料內容

- 保留 8 種技能與 3 種方案；腳本只補缺少的資料，不刪除其他既有資料。
- 建立 6 位示範教練、12 位示範會員。
- 包含既有教練：每位教練每月 2 堂歷史課程，每堂 4–11 筆報名，各月人數有所差異。
- 每位教練另外有未來 2、5、8、11 天的課程，供前台瀏覽與報名。
- 歷史資料從執行當年 1 月到執行當月，以台北時間決定月份；2026 年 9 月執行即涵蓋 1–9 月。
- 示範會員有真正的方案購買紀錄，堂數足以支應歷史報名。報表從這些報名查詢計算，沒有在前端寫死數字。
- 固定識別碼與交易保證同日重跑不重複新增；之後重跑會補上新月份及新的未來課程。已存在的個人資料、密碼、課程與報名不會重設。
- 請只對示範資料庫執行。資料與 `example.com` 上課連結皆為作品展示用途。

### 示範登入

| 身分 | Email | 新建帳號預設密碼 |
| --- | --- | --- |
| 教練 | chen.jianhong@rfitness.tw | Demo12345 |
| 會員 | demo.member1@example.com | Demo12345 |

可用 `DEMO_PASSWORD` 環境變數設定新建帳號密碼；既有帳號密碼不變。教練登入後到「營收報表」查看每月資料，會員可瀏覽課程、報名並查看課表。

### 營收口徑

目前 API 按報名建立月份，取未取消報名的**不重複會員數 × 全部方案總價 / 全部方案總堂數**，最後向下取整；`course_count` 實際是未取消報名筆數。它不是金流實收，也不是已完成課程收入。`CONTEXT.md` 的報名筆數描述與目前程式不同；本次資料腳本依現行 API 驗證，未改動營收商業邏輯。面試時可將這項口徑差異作為後續改善議題。

## 公開部署：Render

前台與教練後台都是同一個 React 網站，由登入角色決定可進入頁面。部署共需一個 Static Site、一個 Express Web Service、一個 PostgreSQL 資料庫。訪客只使用網站網址；資料庫連線資訊留在 API 服務。

### 1. PostgreSQL

在 Render 建立 Postgres，與 API 選同一區域。記下 internal hostname、port、database、username、password，供 API 設定。資料庫使用持久化託管服務，勿放在 Web Service 的暫存檔案系統。

### 2. Express API（Web Service）

連接包含本專案的 GitHub repository：

| 設定 | 值 |
| --- | --- |
| Runtime | Node |
| Root Directory | backend |
| Build Command | npm ci |
| Start Command | npm start |
| Health Check Path | /healthcheck |

環境變數：`DB_HOST`、`DB_PORT`、`DB_DATABASE`、`DB_USERNAME`、`DB_PASSWORD` 使用上述內部資料庫值；`JWT_SECRET` 設為新產生的隨機字串，`JWT_EXPIRES_DAY=1d`，`DB_ENABLE_SSL=false` 用於 Render 同區域內部連線。`PORT` 使用 Render 提供的值。

首次示範建表可設 `DB_SYNCHRONIZE=true`。建表成功後改為 `false` 再部署，避免往後改 Entity 自動變更既有資料；正式 schema 更新應改用 migration。

資料庫建表後，在後端服務 Shell 執行 `node scripts/seed-demo.js`。若所選方案沒有 Shell，可暫時將 Start Command 設為 `node scripts/seed-demo.js && npm start`，第一次成功後還原 `npm start`。不要把 seed 放入一般 build command，建置環境不應負責改動資料。

### 3. React 網站（Static Site）

| 設定 | 值 |
| --- | --- |
| Root Directory | frontend |
| Build Command | npm ci && npm run build |
| Publish Directory | dist |
| Environment | VITE_API_BASE_URL=https://你的API服務.onrender.com/api/ |
| Rewrite | /* → /index.html，Action: Rewrite |

`VITE_API_BASE_URL` 是建置時設定，修改後要重新部署。正式網站不能填 localhost。Rewrite 讓直接開啟 `/coach/earnings` 等 React 路由不會 404。

### 4. 驗收與分享

1. API `/healthcheck` 回傳 200。
2. 用無痕視窗打開公開網站，檢查教練照片、8 種技能、3 種方案與未來課程。
3. 登入示範教練，確認今年 1 月至本月都有營收；登入示範會員確認報名流程。
4. 重新整理深層路由仍能顯示，登出後不能讀取教練個人 API。
5. 將公開網站、示範帳號與本文件連結放到 README／履歷。

這份設定說明尚未建立雲端服務或產生公開網址。Render 免費 Web Service 有閒置休眠，免費 Postgres 有使用期限；面試展示若需長期穩定存取，請先確認所選方案條件與費用。

官方文件：[Express 部署](https://render.com/docs/deploy-node-express-app)、[Static Sites](https://render.com/docs/static-sites)、[Postgres](https://render.com/docs/postgresql)、[免費方案限制](https://render.com/docs/free)。
