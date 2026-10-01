# 展示資料與公開部署

## 線上展示

- 網站：https://r-fitness-web.onrender.com/
- API：https://r-fitness-api.onrender.com/api/
- 健康檢查：https://r-fitness-api.onrender.com/healthcheck
- Render 前端 `r-fitness-web`、後端 `r-fitness-api` 與獨立的 `r-fitness-db` 已建立，連接 GitHub `main`。
- 雲端資料庫為 PostgreSQL 18，與本機 Docker PostgreSQL 16 分離。展示資料由 seed 腳本建立，不需上傳本機會員資料。
- 目前為免費方案，雲端資料庫將於 **2026-10-16** 到期；API 閒置 15 分鐘會休眠，首次請求可能需要約一分鐘。
- 示範帳號見下表。所有購買均為模擬交易，不涉及付款。此環境資料供多人共用，請勿填入敏感資料。

### 2026-10-01 上線驗收

- GitHub 提交 `71fa427` 的後端 Contract Tests、前端建置與 E2E 均通過。
- Render 前端與 API 已部署該提交；API `/healthcheck` 回傳 200，資料庫連線正常。
- 更新雲端示範資料後，公開課表有 7 位教練、28 堂未來課程；瀏覽器確認每頁 6 堂及第二頁導覽正常。
- 示範會員登入、報名扣 1 堂、取消退回 1 堂通過；教練 10 月營收與報名筆數計算相符；未登入存取教練營收回傳 401。
- 一次性 seed 後已還原 API Start Command 為 `npm start`，設定 `DB_SYNCHRONIZE=false`，Health Check Path 為 `/healthcheck`。
- 修正 `verify-demo.js` 的舊營收口徑；在獨立空白 PostgreSQL 16 建立 seed 後，6 位教練 × 10 個月份的 API／SQL 比對、未來課程與剩餘堂數皆通過。本機既有資料未補 10 月歷史資料，直接執行本機 `verify:demo` 會指出該月份缺漏；本次未為了驗證覆寫本機資料。

![正式網站首頁](screenshots/deployed-home.jpg)

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
- 固定識別碼與交易保證同日重跑不重複新增；之後重跑會補上新月份及新的未來課程。腳本會更新其管理的示範會員、課程、購買及歷史報名；示範會員密碼會重設為 `DEMO_PASSWORD`（預設 `Demo12345`）。其他帳號不應用此腳本管理。
- 請只對示範資料庫執行。資料與 `example.com` 上課連結皆為作品展示用途。

### 示範登入

| 身分 | Email | 新建帳號預設密碼 |
| --- | --- | --- |
| 教練 | chen.jianhong@rfitness.tw | Demo12345 |
| 會員 | demo.member1@example.com | Demo12345 |

可用 `DEMO_PASSWORD` 環境變數設定新建帳號與示範會員密碼；既有教練密碼不變。教練登入後到「營收報表」查看每月資料，會員可瀏覽課程、報名並查看課表。

### 營收口徑

API 按報名建立月份，取未取消的**報名筆數 × 全部方案總價 / 全部方案總堂數**，最後向下取整；`course_count` 是未取消報名筆數，`participants` 是不重複會員數。這是模擬營收統計，不是金流實收，也不是已完成課程收入。

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

既有雲端服務網址見本文件開頭。以下操作可重新建立另一組展示環境；請使用獨立的展示資料庫。Render 免費 Web Service 有閒置休眠，免費 Postgres 有使用期限；長期展示需另行選擇方案。

官方文件：[Express 部署](https://render.com/docs/deploy-node-express-app)、[Static Sites](https://render.com/docs/static-sites)、[Postgres](https://render.com/docs/postgresql)、[免費方案限制](https://render.com/docs/free)。
