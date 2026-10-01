---
name: R Fitness Sports Editorial
description: 鈷藍與螢光黃的運動編輯視覺
colors:
  primary: "#123de7"
  primary-deep: "#1536b9"
  accent: "#e4ff43"
  paper: "#f3f3ed"
  surface: "#ffffff"
  text: "#121212"
  muted: "#54565e"
  line: "#c7c9cd"
typography:
  display:
    fontFamily: '"Archivo Black", "Archivo", sans-serif'
    fontSize: "clamp(48px, 6.4vw, 96px)"
    fontWeight: 400
  body:
    fontFamily: '"Noto Sans TC", "Archivo", system-ui, sans-serif'
    fontSize: "16px"
    fontWeight: 400
rounded:
  control: "2px"
spacing:
  mobile-gutter: "20px"
  desktop-gutter: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.text}"
---

## Overview
**Creative North Star: "Move on your terms"**

以運動編輯版面表達自主訓練：鈷藍、螢光黃、大幅自然光運動攝影與清楚的繁體中文操作。公開頁面建立動機，會員與教練頁面以資訊和任務優先。

**Key Characteristics:**
- 鈷藍與螢光黃的高辨識色塊。
- 平面線條、方形控制項、大幅運動攝影。
- 繁體中文操作與粗體英文展示字共存。

## Colors
主色用於主要動作與品牌區塊；螢光黃標示重點、目前分頁與深色背景上的動作。紙色承接長頁，白色用於表單，深墨色提供主要閱讀對比。

**The Contrast Rule.** 黃色表面搭配深色文字，藍色表面搭配白色文字。

## Typography
Archivo Black 用於品牌與展示標題，Noto Sans TC 負責中文閱讀與操作。JetBrains Mono 用於課表日期等數字資訊。英文標題屬展示層，關鍵操作保留繁體中文。

## Layout
公開頁面採最大 1392px 內容容器，桌面左右留白 40px。首頁影像滿版、斜切色塊、下接選課列。760px 以下首屏上下排列，內容留白 20px，課程與方案改為單欄。後台採摘要列、水平導覽及全寬任務區，手機導覽排為兩欄。

## Elevation & Depth
主要靠色塊、照片與細線建立層次，不使用浮起的方案卡片。鍵盤焦點以清楚輪廓呈現。尊重 reduced-motion，避免依賴移動才能辨識狀態。

## Shapes
方形按鈕與圖片是主要語彙；首頁斜切只用於品牌首屏，不套用到表單。操作控制項保留微小圓角，維持可辨識性。

## Components
- 按鈕：藍底白字、黃底黑字與描邊次要動作；保留 hover 與 focus-visible。
- 輸入框：可見標籤、清楚焦點；搜尋與日期直接連到課表。
- 篩選：以黃色與 aria-pressed 表達選取，條件保存在 URL。
- 教練：使用實際資料與個人照片；生成運動攝影僅作品牌情境。
- 課表：日期、時間、課程、教練與報名動作分層；手機日期維持 22px 防止重疊。
- 方案：價格與堂數來自 API，單堂價格最低的方案標為黃色。
- 導覽：桌面置中，手機提供具語意標籤的展開按鈕；工作區目前分頁為黃色。

## Do's and Don'ts
### Do:
- Do 保留 R Fitness、繁體中文與既有角色權限。
- Do 對空資料、載入與 API 失敗提供清楚狀態。
- Do 使用實際課程、教練與價格資料。
### Don't:
- Don't 回到先前淡綠色俱樂部視覺。
- Don't 以生成情境照片假冒實際教練。
- Don't 用裝飾影響預約、購買與表單操作。
