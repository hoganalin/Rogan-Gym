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

現有規格：[`specs/frontend-experience/`](specs/frontend-experience/)
範例變更：[`changes/archive/2026-09-14-dark-gym-redesign/`](changes/archive/2026-09-14-dark-gym-redesign/)
