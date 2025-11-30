## 路由與頁面

- `/chat` 智能貸款還款能力分析（ChatView）
- `/csr` CSR 智能履歷分析（CsrResumeView）

初始路由將導向 `/chat`。

---

## 導覽系統（Guides）

本專案導覽分為兩層：全域歡迎導覽（WelcomeGuide）與各頁面導覽（ChatView/CsrResumeView）。為了避免互相干擾、以及因 KeepAlive 與事件時序導致導覽消失，採用以下策略：

### 1) 全域歡迎導覽（WelcomeGuide）

- 檔案：`src/components/WelcomeGuide.vue`
- 以 sessionStorage 記錄是否顯示過：`sessionStorage.hasSeenGuide`
- 發送事件：
  - `open`：判斷將顯示時即刻觸發（即便有延遲動畫），讓子頁面知道上層導覽「正在」顯示。
  - `close`：導覽關閉時觸發。
- 從卡片導向頁面（navigateTo）時，寫入一次性旗標：
  - `sessionStorage.pendingChildGuide = 'chat' | 'csr'`（本次會話有效，進入目標頁面後清除）

### 2) 子頁面導覽（ChatView / CsrResumeView）

- 檔案：
  - `src/views/ChatView.vue`
  - `src/views/CsrResumeView.vue`
- 以 localStorage 記錄「不再顯示」：
  - ChatView：`localStorage['chatview-guide-shown']`
  - CSR：`localStorage['csrresumeview-guide-shown']`
- 顯示條件（全部滿足才會自動顯示）：
  - 組件處於活動狀態（KeepAlive 的 `onActivated` 會設為 active）
  - 路由名稱符合（`route.name === 'chat'` 或 `route.name === 'csr'`）
  - 全域歡迎導覽已關閉（由 `provide/inject` 取得 `isWelcomeGuideVisible === false`）
- 一次性強制顯示（無視 localStorage）：
  - 若偵測到 `sessionStorage.pendingChildGuide` 與當前頁面相符，將直接顯示導覽並清除此旗標。
- UI 設定：兩個子導覽皆設置 `append-to-body` 與 `:z-index="4000"`，避免被其他 overlay 蓋住。
- 手動開啟：頁面標題右側的「?」圖示可隨時手動開啟導覽。

### 3) 版面與狀態溝通

- 檔案：`src/layouts/MainLayout.vue`
- 使用 `provide('isWelcomeGuideVisible', ref(false))` 將全域導覽顯示狀態傳遞給子頁面。
- `WelcomeGuide` 以 `@open` 與 `@close` 更新此狀態；子頁面用 `inject` 接收並 `watch`。

---

## 專案結構說明

```text
App.vue
main.js
package.json
README.md
vite.config.js
components/
  ChatInput.vue
  ChatMessage.vue
  WelcomeGuide.vue
layouts/
  MainLayout.vue
  HeaderBar.vue
  SideMenu.vue
  AppFooter.vue
views/
  ChatView.vue
  CsrResumeView.vue
  BlankView.vue
router/
  index.ts
styles/
  global.css
  theme.css
```

---

## 主要檔案說明

- `components/WelcomeGuide.vue`：全域歡迎導覽；負責 session 記錄與跨頁一次性導覽觸發。
- `layouts/MainLayout.vue`：提供 `isWelcomeGuideVisible` 狀態給子頁；管理側邊選單與頁面容器。
- `views/ChatView.vue`：貸款分析聊天頁；含子導覽顯示邏輯與表單資料快照顯示。
- `views/CsrResumeView.vue`：CSR 履歷分析頁；含子導覽顯示邏輯與檔案上傳、分析流程。
- `router/index.ts`：路由定義與初始導向。

---

## 授權

MIT License
