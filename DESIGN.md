---
name: R Fitness Sports Editorial
description: 鈷藍與網球黃的運動編輯視覺，公開頁激發動機，後台俐落完成任務
colors:
  track-cobalt: "#123de7"
  track-cobalt-bright: "#3159ef"
  track-cobalt-deep: "#132a8e"
  track-cobalt-night: "#10182c"
  cobalt-mist: "#ccd6ff"
  tennis-ball-yellow: "#e4ff43"
  tennis-ball-yellow-pressed: "#d3ed24"
  chalk-paper: "#f3f3ed"
  surface-white: "#ffffff"
  soft-gray: "#e9eaf0"
  ink: "#121212"
  muted-slate: "#54565e"
  faint-slate: "#62646c"
  hairline: "#c7c9cd"
  on-dark-muted: "#d1d5e0"
  clay-red: "#a53434"
typography:
  display:
    fontFamily: '"Archivo Black", "Archivo", "Noto Sans TC", sans-serif'
    fontSize: "clamp(48px, 6.4vw, 96px)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: '"Archivo", "Noto Sans TC", sans-serif'
    fontSize: "clamp(27px, 3vw, 44px)"
    fontWeight: 900
    lineHeight: 1.3
    letterSpacing: "-0.035em"
  title:
    fontFamily: '"Archivo", "Noto Sans TC", sans-serif'
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  body:
    fontFamily: '"Noto Sans TC", "Archivo", system-ui, sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
  body-small:
    fontFamily: '"Noto Sans TC", "Archivo", system-ui, sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: '"Noto Sans TC", "Archivo", system-ui, sans-serif'
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: '"JetBrains Mono", monospace'
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.05em"
rounded:
  square: "0px"
  control: "2px"
spacing:
  mobile-gutter: "20px"
  desktop-gutter: "40px"
  section: "64px"
  section-mobile: "40px"
components:
  button-primary:
    backgroundColor: "{colors.track-cobalt}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.square}"
    padding: "14px 24px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.track-cobalt-deep}"
  button-accent:
    backgroundColor: "{colors.tennis-ball-yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "14px 24px"
    height: "50px"
  button-accent-hover:
    backgroundColor: "{colors.tennis-ball-yellow-pressed}"
  button-workspace-primary:
    backgroundColor: "{colors.track-cobalt}"
    textColor: "{colors.surface-white}"
    typography: "{typography.body-small}"
    rounded: "{rounded.control}"
    padding: "10px 24px"
    height: "44px"
  button-workspace-secondary:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 24px"
    height: "44px"
  button-workspace-danger:
    textColor: "{colors.clay-red}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "44px"
  field-input:
    backgroundColor: "{colors.chalk-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "14px 16px"
  field-label:
    textColor: "{colors.muted-slate}"
    typography: "{typography.label}"
  workspace-tab-active:
    backgroundColor: "{colors.tennis-ball-yellow}"
    textColor: "{colors.ink}"
    padding: "14px 24px"
  filter-chip-selected:
    backgroundColor: "{colors.tennis-ball-yellow}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
---

# Design System: R Fitness Sports Editorial

## Overview

**Creative North Star: "Move on your terms"**

R Fitness 把訓練表達為自主選擇。公開頁面像一本運動雜誌的跨頁：鈷藍色塊、斜切的首屏、大幅自然光運動攝影，以及斜體粗黑的英文展示字。它的任務是讓人想動起來，並在一屏之內給出選課入口。

會員與教練的工作區換一種語氣：俐落、可靠、不搶戲。品牌只出現在頂部橫幅、數字摘要和目前分頁的網球黃，任務區回到白底表單、紙色輸入框和單一主色動作。兩邊共享同一組色彩與字體，所以從公開頁登入後仍是同一個世界。

整個系統是平面的：靠色塊、照片和 1px 細線建立層次，不使用陰影或浮起的卡片。已確認要避免的方向是先前的淡綠色俱樂部視覺。

**Key Characteristics:**
- 鈷藍與網球黃兩個高辨識色塊，配紙色長頁。
- 公開頁方形直角，後台控制項 2px 微圓角。
- Archivo Black 斜體英文展示字，加上 Noto Sans TC 的繁體中文操作文字。
- 用細線與色塊分層，不用陰影。

## Colors

高彩度的運動色，放在中性的紙色和墨色之上，每個顏色都有明確的位置。

### Primary
- **Track Cobalt** (#123de7)：主要動作按鈕、首屏面板、課表區塊、會員工作區橫幅、品牌斜線。對應 CSS `--color-brand-500`。
- **Track Cobalt Bright** (#3159ef)：連結與導覽的 hover，以及後台次要元素的 hover 邊框。對應 `--color-brand-400`。
- **Track Cobalt Deep** (#132a8e)：主要按鈕 hover。對應 `--color-brand-700`。
- **Track Cobalt Night** (#10182c)：選取文字的前景色。對應 `--color-brand-900`。
- **Cobalt Mist** (#ccd6ff)：文字選取的底色。對應 `--color-brand-200`。

### Secondary
- **Tennis-Ball Yellow** (#e4ff43)：標示「目前」與「推薦」，例如工作區目前分頁、已選篩選條件、單堂價格最低的方案、教練年資標籤、深色背景上的主要動作、頁尾標語。對應 `--color-accent`。
- **Tennis-Ball Yellow Pressed** (#d3ed24)：黃色按鈕與推薦方案的 hover。對應 `--color-accent-hover`。

### Neutral
- **Chalk Paper** (#f3f3ed)：頁面底色，也是後台輸入框的底色。注意 CSS 變數名稱是 `--color-ink`，但它是紙色，不是墨色。
- **Surface White** (#ffffff)：表單容器、清單列、次要按鈕底色。對應 `--color-surface`。
- **Soft Gray** (#e9eaf0)：次要按鈕 hover、已取消項目的底色。對應 `--color-soft`。
- **Ink** (#121212)：主要文字、頁尾與教練橫幅底色、版面主分隔線。對應 `--color-body`。
- **Muted Slate** (#54565e)：說明文字、欄位標籤。對應 `--color-muted`。
- **Faint Slate** (#62646c)：placeholder、停用欄位文字。對應 `--color-faint`。
- **Hairline** (#c7c9cd)：清單、輸入框與次要分隔線。對應 `--color-line`。
- **On-Dark Muted** (#d1d5e0)：墨色或深藍背景上的次要文字。對應 `--color-on-dark-muted`。

### Semantic
- **Clay Red** (#a53434)：錯誤訊息、刪除與取消報名等破壞性動作。對應 `--color-danger`，Tailwind 寫成 `text-danger`。

### Named Rules
**The Contrast Pairing Rule.** 黃色表面一律配墨色文字，鈷藍表面一律配白色文字。黃色永遠不當文字顏色放在淺色底上。

**The Yellow Means Now Rule.** 網球黃只表示「目前」、「已選」或「推薦」。一個畫面裡同時出現的黃色元素不超過一組。

## Typography

**Display Font:** Archivo Black（fallback 為 Archivo、Noto Sans TC）
**Body Font:** Noto Sans TC（fallback 為 Archivo、system-ui）
**Label/Mono Font:** JetBrains Mono

**Character:** 斜體粗黑的英文展示字負責氣勢，繁體中文負責所有實際操作。英文是展示層，關鍵動作與說明一律用中文。

### Hierarchy
- **Display**（Archivo Black 斜體，clamp(48px, 6.4vw, 96px)，行高 0.98）：首屏 MOVE ON / YOUR TERMS.、訓練分類磚、工作區橫幅標題、頁尾標語。CSS 變數 `--font-poster`。
- **Headline**（900，clamp(27px, 3vw, 44px)）：區塊標題，手機版 28px。
- **Title**（800，34px，手機 30px）：工作區頁面標題，由 WorkspaceHeading 元件輸出。
- **Body**（400，16px，行高 1.7）：內文與輸入值。
- **Body Small**（14px）：按鈕文字、工作區說明。對應 `--text-sm`。
- **Caption**（13px）：摘要列標示、頁尾連結、小型按鈕。對應 `--text-caption`。
- **Label**（JetBrains Mono，11px，字距 0.05em）：表單欄位標籤與資料標記。課表日期與時間這類數字也用 mono 和 tabular numerals。

### Named Rules
**The Chinese Carries the Action Rule.** 英文展示字可以設成 `aria-hidden`，但每一個英文標題旁邊都要有中文標題或說明承擔意義。

## Layout

公開頁使用最大 1392px 的內容容器，桌面左右留白 40px，760px 以下改為 20px。區塊間距桌面 64px、手機 40px。首屏左邊是鈷藍面板（約 55% 寬，右緣斜切），右邊是滿版照片，下方緊接搜尋列，接著是三欄訓練分類磚。760px 以下首屏改為上下排列，斜切取消，課程與方案改成單欄。

工作區由上而下是：鈷藍或墨色的品牌橫幅、三欄數字摘要列、水平分頁、全寬任務區。分頁在手機排成兩欄。任務區的頁首（WorkspaceHeading）允許換行，右側動作在窄螢幕時會掉到標題下方。表單最大寬度約 420 到 560px，欄位間距 18 到 20px。

斷點：1100px（首屏縮放）、760px（手機版）、480px（小手機）。

## Elevation & Depth

系統完全平面，不使用 box-shadow。層次由三種方式建立：色塊（鈷藍、網球黃、墨色）、照片，以及細線（版面主分隔用 1px 墨色，次要分隔用 1px Hairline）。工作區表單用白底加 2px 墨色上邊框，從紙色背景中區隔出來。

唯一的動態是首屏照片進場時的 clip-path 展開（0.6s，cubic-bezier(.16,1,.3,1)），以及訓練照片 hover 時 1.035 倍的放大。`prefers-reduced-motion: reduce` 時兩者都會關閉。

### Named Rules
**The Line Not Shadow Rule.** 需要分層時用色塊或細線，不要加陰影，也不要讓卡片在 hover 時浮起。

## Shapes

公開頁是方形世界：按鈕、圖片、標籤、篩選鈕和方案卡都是 0 圓角。首屏面板的斜切是品牌簽名，只用在首屏，不套用到表單或卡片。

工作區的控制項（輸入框、按鈕、清單列、檢視切換）統一使用 2px 微圓角（`--radius-control`），在 Tailwind 寫成 `rounded-(--radius-control)`。不要寫 `rounded-[4px]` 或 `rounded-md` 這類任意值。

## Components

### Buttons
所有按鈕共用 `.btn` 基底，包括圖示間距 16px、不換行、700 字重。
- **Shape:** 公開頁直角（0px），工作區微圓角（2px）。
- **Primary:** Track Cobalt 底、白字；hover 時變成 Track Cobalt Deep。公開頁高 50px、內距 14px 24px。
- **Accent:** 網球黃底、墨色字，用於鈷藍或墨色背景上的主要動作；hover 時變成 Pressed 黃。
- **Outline White:** 透明底、白色邊框，用於首屏的次要動作；hover 時反白。
- **Workspace (`<Button>`):** variant 有 primary、secondary、danger，高 44px、內距 10px 24px、14px 字。`size="sm"` 時內距 16px、13px 字。預設 `type="button"`，送出表單時要明確寫 `type="submit"`。
- **Danger:** 透明底、Clay Red 文字與邊框，hover 時有 8% 紅色底。純文字的刪除連結用 `.btn-ghost-danger`。
- **Focus:** 2px Track Cobalt outline，offset 4px。

### Inputs / Fields
- **Style（`<Field label>`）:** 外層 label 包著 mono 欄位標籤和原生 input、select 或 textarea。欄位本身是 1px Hairline 邊框、2px 圓角、內距 14px 16px，工作區內底色為 Chalk Paper。網址類欄位加 `mono` 改用 JetBrains Mono。
- **Focus:** 邊框轉為 Track Cobalt，外加 2px 鈷藍 outline。
- **Disabled:** 文字變成 Faint Slate，滑鼠游標為 not-allowed。
- **獨立欄位:** 沒有可見標籤的欄位（例如技能新增）使用 `.field-control`，並搭配 `sr-only` 的 label。

### Workspace Heading
`<WorkspaceHeading title action>` 輸出工作區頁面的 h1、可選的說明段落，以及右側的動作。所有工作區頁面都應使用它，不要再手寫 h1 的樣式。

### Status Text
`<StatusText>` 用於載入中與空資料，`<StatusText error>` 用於錯誤，會帶 `role="alert"`。公開頁需要重試按鈕時改用 `<DataState>`。

### Navigation
- **公開頁:** 桌面導覽置中、15px、700 字重，hover 時變成 Track Cobalt Bright。手機有一個具語意標籤的展開按鈕。頁首底部是 1px 墨色線。
- **工作區分頁:** 水平排列，目前分頁是網球黃底、墨色字，手機排成兩欄。
- **檢視切換:** 細線外框包住的分段按鈕，選取項目為鈷藍底、白字，並使用 `aria-pressed`。

### Filter Chips
直角、白底，選取時變成網球黃底並加上墨色邊框，使用 `aria-pressed`。篩選條件保存在 URL。

### Course Row（簽名元件）
日期（大字數字加星期）、時間、課程名稱與說明、教練與專項、報名按鈕，分成四欄並以細線分隔。在鈷藍課表區塊內，線條改為淺鈷藍，報名按鈕改為網球黃。手機版日期固定 22px，避免重疊。

### Package Card
三張方案用墨色細線連成一排，不是浮起的卡片。單堂價格最低的方案整張填滿網球黃。價格與堂數都來自 API。

## Do's and Don'ts

### Do:
- **Do** 新增的顏色、字級和圓角先加進 `@theme` 或 `:root` token，再在元件中引用。
- **Do** 工作區頁面使用 `WorkspaceHeading`、`Field`、`Button`、`StatusText`，不要重寫長串 Tailwind class。
- **Do** 黃色表面配墨色字，鈷藍表面配白字。
- **Do** 為每一個英文展示標題搭配中文標題或說明。
- **Do** 為載入、空資料、錯誤提供明確狀態；破壞性動作用 Clay Red 並在按鈕名稱寫出對象，例如「取消報名 某課程」。
- **Do** 使用實際的教練照片與 API 資料；生成的運動攝影只當品牌情境。

### Don't:
- **Don't** 回到先前的淡綠色俱樂部視覺。
- **Don't** 加陰影、浮起卡片或漸層文字。
- **Don't** 在工作區使用 `rounded-[4px]`、`rounded-md` 這類任意圓角，或在公開頁加圓角。
- **Don't** 把首屏斜切用在表單或卡片。
- **Don't** 寫死色碼，像 `#121212`、`#e4ff43` 都已經有 token。
- **Don't** 以生成的情境照片假冒實際教練。
- **Don't** 用 ← → 這類文字字元充當圖示，請用 ClubUI 的 `<Icon>`。
