# Tasks

## 1. 畫面改版（7 個畫面）

- [x] 1.1 `RootLayout` — 深色導覽列 + 大頁尾，`npm run build` 過、瀏覽器截圖比對設計稿
- [x] 1.2 `HomeView` — 主視覺／統計／教練輪播／本週課程／方案／見證
  - [x] 1.2.1 修正 hero 圖片左側品牌浮水印被裁切不完全的 bug（換成設計稿原始的四段式 gradient）
  - [x] 1.2.2 新增 `getCoachCards()`：`GET /coaches` 只回 `{id,user_id,name}`，前端用 `GET /coaches/:id` + `GET /coaches/:id/courses` 組成卡片需要的完整資料（不新增後端欄位）
- [x] 1.3 `CoachesView` — 搜尋 + 技能篩選 chips + 前端分頁
- [x] 1.4 `LoginView` / `SignupView` — 拆出 `RootLayout`，改成獨立左右分割版面
- [x] 1.5 `user/DashboardView` — 週曆／月曆／清單三種檢視（`UserLayout` 用 Outlet context 共享 `GET /users/courses` 一次抓取的結果）
- [x] 1.6 `user/BecomeCoachView` — 3 步驟指示器
- [x] 1.7 `coach/ProfileView` + `CoachLayout` — 左表單／右即時預覽，側邊欄顯示真實課程數／技能數／本月營收

## 2. SweetAlert 報名成功彈窗

- [x] 2.1 改成深色卡片樣式（設計稿規則）
- [x] 2.2 用瀏覽器 `Swal.fire` 直接渲染同一份設定，截圖確認視覺跟設計稿一致

## 3. GSAP 捲動效果

- [x] 3.1 `useScrollFx` 接進 `HomeView`／`CoachesView`，補齊 `data-hero`／`data-reveal`／`data-count`／`data-rise`／`data-pkg`／`data-nav` 標記
- [x] 3.2 把兩個頁面的內容延後到資料載入完成才 mount，避免 `ScrollTrigger.batch` 掃到空殼 DOM
- [x] 3.3 **抓到並修好 hook 本身的 bug**：React StrictMode 開發模式下 effect 會 mount→cleanup→mount 兩次，count-up 動畫會把自己動畫過程中的中間值（0）當成第二次的目標值，卡在 0。修法：把原始目標值快取進 `data-count-target` 屬性，不要每次都重新解析 `textContent`
- [x] 3.4 用 `page.emulateMedia({reducedMotion:'reduce'})` 驗證：關閉動畫時所有元素維持最終狀態，沒有卡在 `opacity:0`

## 4. E2E 迴歸測試（改版後才發現的既有測試依賴）

實際跑 `npx playwright test`，不是只憑肉眼檢查，抓到並修好：

- [x] 4.1 SweetAlert 改用 `html` 取代 `title` 後，`.swal2-title` 找不到「報名成功」文字 → 改回 `title` + `icon:"success"`，細節塞進 `html`
- [x] 4.2 教練登入後導覽列連結文字從「教練後台」變成顯示教練本人名字 → 改回固定文字
- [x] 4.3 技能標籤從真的 `<input type="checkbox">` 變成純樣式按鈕，`getByLabel(...).check()` 沒東西可操作 → 改回真 checkbox（視覺上是滿版透明 overlay）
- [x] 4.4 方案卡／課程列表／課表清單的標題從 `<h3>` 退化成 `<div>`/`<span>`，`getByRole("heading",...)` 找不到 → 全部改回語意化標題
- [x] 4.5 註冊按鈕文字跟設計稿一致改成「建立帳號」，但既有測試預期「註冊」→ 改回「註冊」
- [x] 4.6 課表預設檢視改成「週曆」，但既有測試預期一進頁面就看到「取消報名」按鈕（只有清單檢視有）→ 預設改成「清單」
- [x] 4.7 新增的頁尾跟導覽列出現重複的「教練列表」連結文字，既有測試的 `getByRole("link",...)` 選不到指定的那一個 → 在測試裡把選擇器 scope 到 `navigation` landmark（app 行為本身是對的，只是選擇器需要精確化）
- [x] 4.8 全部修完後重跑 `npx playwright test`：2 個 spec 全過；`npm run test:e2e:types` 過

## 5. Root 層官方合約測試（68 個）

- [x] 5.1 跑 `npm test`（`test/m1~m6` + `smoke`，黑箱、自帶隨機資料），確認深色改版跟資料庫清理沒有影響這套既有的合約測試：68/68 通過

## 6. Demo 資料

- [x] 6.1 清空本機開發資料庫裡累積的壓測垃圾資料（784 個帳號、378 個「會員xxxx」假教練，無照片無技能）
- [x] 6.2 寫 `scripts/seed-demo-data.mjs`，只打真實 API（signup→promote→self-update→create course），照設計稿的 `COACHES`/`SKILLS` 陣列灌 6 位教練（真人照片、正常敘述）、8 個技能、3 個方案、6 堂課程
- [x] 6.3 教練照片：後端驗證要求 `profile_image_url` 必須 `https` 開頭，本地 `/assets/coach-0X.png` 過不了 → API 呼叫先用假 https 佔位網址建立資料，事後用一段有註明用途的 SQL `UPDATE` 換回本地路徑
- [x] 6.4 每跑一次 `npm test` 或 `npx playwright test` 都會用隨機「會員xxxx」名字重新生出新的假教練/會員（測試套件本身的隨機 fixture 機制）；事後用同一份 email 白名單 SQL 清掉非 demo 帳號，驗證只剩 6 位教練
