# openspec/

這個資料夾遵循 [OpenSpec](https://github.com/Fission-AI/OpenSpec) 的規格驅動開發（Spec-Driven Development）慣例，也是 [Spectra](https://spectra.5xcamp.us/) 這類工具讀取規格的目錄結構：

```
openspec/
├── specs/            # 目前生效的能力規格（要求 + 情境）
└── changes/
    └── archive/      # 已完成並封存的變更提案
        └── <日期>-<變更名稱>/
            ├── proposal.md   # 為什麼改、改了什麼
            └── tasks.md      # 實作檢查清單（含驗證方式）
```

每個變更從 `proposal.md` 開始（為什麼需要、影響範圍），完成後對照 `tasks.md` 逐項打勾，再把結果併入 `specs/` 底下對應能力的規格。這個 repo 用它來記錄前端改版這類「範圍大、影響多個檔案」的變更，取代單純的 commit message 敘述。

## 現有規格

- [`core-platform`](specs/core-platform/spec.md) — 帳號與角色、報名／取消、堂數計算、月營收、技能標籤共用規則
- [`frontend-experience`](specs/frontend-experience/spec.md) — 深色主題、教練搜尋篩選、課表三種檢視、捲動進場效果的無障礙行為

## 變更歷史（依時間序）

React 重寫系列是回溯記錄的（原始開發用 [`docs/superpowers/plans/`](../docs/superpowers/plans/) 的詳細計畫執行，這裡的 `proposal.md`／`tasks.md` 是精簡後的規格化版本，細節請點進完整計畫）：

1. [`2026-09-11-frontend-foundation`](changes/archive/2026-09-11-frontend-foundation/) — React + TypeScript + Vite 骨架，取代原本的 Vue 前端
2. [`2026-09-11-public-pages`](changes/archive/2026-09-11-public-pages/) — 首頁／教練列表／教練詳細／健身方案接上真實資料
3. [`2026-09-12-member-area`](changes/archive/2026-09-12-member-area/) — 會員課表／個人資料／購買紀錄／成為教練
4. [`2026-09-12-coach-area`](changes/archive/2026-09-12-coach-area/) — 教練檔案／課程管理／技能標籤／營收報表
5. [`2026-09-12-e2e-tests`](changes/archive/2026-09-12-e2e-tests/) — 第一套真正提交的 Playwright E2E 測試
6. [`2026-09-13-ci-and-portfolio-cleanup`](changes/archive/2026-09-13-ci-and-portfolio-cleanup/) — 前端 CI、清理舊環境用語
7. [`2026-09-14-dark-gym-redesign`](changes/archive/2026-09-14-dark-gym-redesign/) — 深色重訓風改版 + GSAP 捲動效果（含改版過程中抓到並修好的 E2E 迴歸與 demo 資料整理）
