# R Fitness（健身房課程預約平台）

一個健身房會員／教練／課程預約平台，品牌名稱為 R Fitness。後端：Node.js + Express + PostgreSQL；前端：React + TypeScript。

## Language

**Coach（教練）**：
可開課、維護個人技能與課程的角色。一般 User 透過升級取得此角色，不是獨立註冊的帳號類型。
_Avoid_: Trainer, Instructor

**User（會員）**：
註冊帳號的基本角色，可購買方案、報名課程。
_Avoid_: Member, Customer（UI 文案可用「會員」，但程式與資料模型統一用 User）

**CreditPackage（方案）**：
可購買的堂數方案，購買後轉換為可報名課程的堂數額度。
_Avoid_: Plan, Membership

**CreditPurchase（購買紀錄）**：
User 購買 CreditPackage 的交易紀錄。

**CourseBooking（報名）**：
User 對 Course 的報名紀錄。取消採**軟刪除**（標記取消時間，紀錄保留，不刪除該筆資料）。
_Avoid_: Registration, Enrollment（後端／資料模型用 CourseBooking，UI 文案可用「報名」）

**Skill（技能）**：
教練具備的專長標籤，用於課程分類與教練檔案展示，透過 CoachLinkSkill 與 Coach 關聯。

## Relationships

- 一個 **User** 可升級為 **Coach**（角色轉換，非新增實體）
- 一個 **Coach** 可開設多個 **Course**，並具備多個 **Skill**（透過 CoachLinkSkill）
- 一個 **User** 可購買多個 **CreditPackage**（產生 **CreditPurchase** 紀錄），並用堂數額度報名多個 **Course**（產生 **CourseBooking** 紀錄）
- 剩餘堂數不是資料庫欄位，而是「總購買堂數 − 未取消的報名數」即時計算而得
- 月營收（Coach 角度）＝ 當月未取消的 **CourseBooking** 數 × 單堂均價（單堂均價 = 全部方案總價 ÷ 全部方案總堂數，先乘再無條件捨去）

## Example dialogue

> **Dev**：「User 報名後如果被取消，這筆 CourseBooking 會被刪除嗎？」
> **Domain expert**：「不會，是軟刪除——標記取消時間，紀錄保留。取消過的課不能再報名，剩餘堂數也是即時算出來的，不是存在欄位裡。」

## Flagged ambiguities

- 先前版本的前端路由中有 `/admin` 區段（含 promote-trainer、skills 管理），但後端與資料模型中**沒有獨立的 Admin 角色／實體**——這其實是「User 升級為 Coach」與「Skill 維護」功能，先前只是把它們歸類在 admin 路徑下。重新設計前端時，這兩個功能應依角色歸類到對應介面，不應暗示存在後端未定義的 Admin 角色。
