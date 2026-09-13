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

## 專案文件

- 領域詞彙與關係：[CONTEXT.md](CONTEXT.md)
- API 規格：[docs/openapi.yaml](docs/openapi.yaml)（Swagger UI：`http://localhost:8081`）
