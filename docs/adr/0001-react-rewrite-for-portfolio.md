# 前端全面改用 React 重寫，後端不動，並改名 R Fitness

**狀態**：accepted

這個專案要作為個人求職作品集使用。決定讓前端全面改用 React + TypeScript + Vite + Tailwind CSS 重寫（取代原本的 Vue 3 + Pinia + echarts），後端（Node.js + Express + PostgreSQL）維持現狀，品牌改名為 R Fitness，UI 文案維持繁體中文（僅品牌名為英文）。

**採用理由**：全部重寫（而非只換色重新套皮）能多產出一份用主流框架獨立完成的作品，也是練習說明「AI 輔助開發如何驗證產出正確性」這個能力的機會。

## Considered Options

- **只換皮**（沿用 Vue／Pinia，只改配色與文案）：成本較低，但無法多產出一份 React 作品，予以放棄。
- **維持 Vue，不重寫**：保留現狀最省事，但無法展示前端框架的獨立實作能力，予以放棄。

## Consequences

- 互動元件（sweetalert2）與測試範圍（僅 Playwright E2E 涵蓋登入→瀏覽教練→報名課程→查看課表的關鍵路徑，不做大量 unit test）是刻意的範圍取捨，避免在作品集時程內過度工程化。
- 前端路由中「/admin」路徑對應的功能（升級教練、技能維護）在後端沒有對應的 Admin 角色，重新設計時需要依 [CONTEXT.md](../../CONTEXT.md) 的說明重新歸類，避免暗示不存在的角色。**已解決**：分別歸類至 `/user/become-coach`（USER 角色）與 `/coach/skills`（COACH 角色）。
