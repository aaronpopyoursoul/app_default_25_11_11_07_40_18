<template>
  <div class="chat-view">
    <!-- macOS 風格動態背景 -->
    <div class="macos-animated-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <!-- 主要內容 -->
    <div class="chat-card">
      <h2 class="title">
        <div class="title-content">
          <span class="title-icon">💳</span>
          <span class="title-text">智能貸款還款能力分析</span>
        </div>
        <el-icon class="help-icon" @click="showGuideDialog = true"><QuestionFilled /></el-icon>
      </h2>
      <div ref="messagesContainer" class="messages-container">
        <transition-group name="message-fade" tag="div">
          <ChatMessage
            v-for="(msg, index) in messages"
            :key="msg.id"
            :message="msg"
            :disabled="isWaitingResponse"
            @show-form="showFormSnapshot"
            @send-question="handleSuggestedQuestion"
          />
        </transition-group>
        <div v-if="isWaitingResponse" class="typing">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>
    <ChatInput :disabled="isWaitingResponse" @send="handleSend" @form-data-update="handleFormDataUpdate" />

    <!-- 使用說明彈窗 -->
    <el-dialog
      v-model="showGuideDialog"
      title=""
      width="520px"
      :show-close="false"
      class="guide-dialog"
      align-center
      append-to-body
      :z-index="4000"
    >
      <div class="guide-content">
        <div class="guide-header">
          <h2 class="guide-title">智能還款能力評估 - 使用說明</h2>
        </div>

        <div class="guide-steps">
          <div class="step-card">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3 class="step-title">生成測試數據</h3>
              <p class="step-desc">點擊「數據生成」按鈕,選擇樣本數據</p>
            </div>
          </div>

          <div class="step-card">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3 class="step-title">儲存數據</h3>
              <p class="step-desc">按下關閉後數據將自動儲存</p>
            </div>
          </div>

          <div class="step-card">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3 class="step-title">開始對話</h3>
              <p class="step-desc">輸入問題後按下送出按鈕</p>
            </div>
          </div>

          <div class="step-card">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3 class="step-title">進階分析</h3>
              <p class="step-desc">根據風險評估結果進行深入討論</p>
            </div>
          </div>
        </div>

        <div class="guide-footer">
          <el-checkbox v-model="dontShowAgain" size="large">
            不再顯示此提示
          </el-checkbox>
          <el-button type="primary" size="large" @click="closeGuide" class="got-it-btn">
            我知道了
          </el-button>
        </div>
      </div>
    </el-dialog>
    <!-- 授信審查資訊唯讀 Dialog -->
    <el-dialog v-model="showFormSnapshotDialog" title="授信審查資訊" width="680px" :show-close="true" align-center class="snapshot-dialog">
      <div v-if="activeSnapshotId && formSnapshots[activeSnapshotId]" class="snapshot-content">
        <div class="snapshot-group" v-for="group in snapshotGroups" :key="group.title">
          <div class="snapshot-group-title">{{ group.title }}</div>
          <el-descriptions :column="2" border class="snapshot-descriptions">
            <template v-for="key in group.keys" :key="key">
              <el-descriptions-item v-if="(formSnapshots[activeSnapshotId] as any)[key]" :label="fieldLabels[key] || key">
                <span v-if="key === 'loan_amnt' || key === 'installment' || key === 'annual_inc' || key === 'revol_bal'" class="currency-value">
                  <span class="currency-number">{{ formatCurrency((formSnapshots[activeSnapshotId] as any)[key]) }}</span>
                  <span class="currency-unit">USD</span>
                </span>
                <span v-else>
                  {{
                    key === 'int_rate' || key === 'revol_util' || key === 'dti'
                      ? formatPercent((formSnapshots[activeSnapshotId] as any)[key])
                      : toLabel(key, (formSnapshots[activeSnapshotId] as any)[key])
                  }}
                </span>
              </el-descriptions-item>
            </template>
          </el-descriptions>
        </div>
      </div>
      <template #footer>
        <el-button @click="showFormSnapshotDialog = false">關閉</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onActivated, onDeactivated, inject } from 'vue'
import { useRoute } from 'vue-router'
import { QuestionFilled } from '@element-plus/icons-vue'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInput from '@/components/ChatInput.vue'
import { useScrollToBottom } from '@/hooks/useScrollToBottom'
import type { ChatMessage as ChatMessageType, ChatFile } from '@/types/chat'
import { chatWithAI } from '@/services/lendingClubApi'
import type { ChatRequest, LoanInput } from '@/types/api'
import { ElMessage } from 'element-plus'
import { TERM_OPTIONS, GRADE_OPTIONS, SUB_GRADE_OPTIONS, HOME_OWNERSHIP_OPTIONS, VERIFICATION_STATUS_OPTIONS, PURPOSE_OPTIONS, APPLICATION_TYPE_OPTIONS } from '@/constants/lendingEnums'

// 設定組件名稱以支援 KeepAlive
defineOptions({
  name: 'ChatView'
})

interface ExtendedChatMessage extends ChatMessageType { avatar?: string }

const messages = ref<ExtendedChatMessage[]>([])
// 表單快照：存放不同 form_data 的內容，鍵為 snapshotId
const formSnapshots = ref<Record<string, LoanInput>>({})
// 活動快照 Dialog 狀態
const showFormSnapshotDialog = ref(false)
const activeSnapshotId = ref<string | null>(null)
// 中文標籤對照
const fieldLabels: Record<string, string> = {
  loan_amnt: '貸款金額',
  term: '期限/期數',
  int_rate: '利率',
  installment: '分期付款金額',
  grade: '貸款等級',
  sub_grade: '貸款子等級',
  emp_title: '職位名稱',
  emp_length: '職位年資',
  home_ownership: '房屋所有權',
  annual_inc: '年收入',
  verification_status: '驗證狀態',
  issue_d: '核發月份',
  purpose: '目的',
  dti: '債務收入比',
  earliest_cr_line: '最早信用紀錄月份',
  open_acc: '開立帳戶數',
  pub_rec: '公共紀錄',
  revol_bal: '循環餘額',
  revol_util: '循環使用率(%)',
  total_acc: '累積帳戶總數',
  mort_acc: '抵押貸款戶數',
  pub_rec_bankruptcies: '破產紀錄次數',
  application_type: '申請類型'
}

// 將 value 轉換為對應的中文 label（未命中則回傳原值）
const toLabel = (key: string, value: any): string => {
  const valStr = String(value)
  const valUpper = valStr.toUpperCase()
  const findLabel = (opts: { value: string; label: string }[]) =>
    opts.find(o => o.value === valStr || o.value === valUpper)?.label
  switch (key) {
    case 'term': return findLabel(TERM_OPTIONS) || String(value)
    case 'grade': return findLabel(GRADE_OPTIONS) || String(value)
    case 'sub_grade': return findLabel(SUB_GRADE_OPTIONS) || String(value)
    case 'home_ownership': return findLabel(HOME_OWNERSHIP_OPTIONS) || String(value)
    case 'verification_status': return findLabel(VERIFICATION_STATUS_OPTIONS) || String(value)
    case 'purpose': return findLabel(PURPOSE_OPTIONS) || String(value)
    case 'application_type': return findLabel(APPLICATION_TYPE_OPTIONS) || String(value)
    default: return String(value)
  }
}
const messagesContainer = ref<HTMLElement | null>(null)
const sessionId = ref(`user-${Date.now()}`) // 為每個用戶會話生成唯一 ID
const currentFormData = ref<LoanInput | null>(null) // 儲存當前的表單數據
const lastSentFormData = ref<LoanInput | null>(null) // 儲存上次發送的表單數據
const isWaitingResponse = ref(false) // 等待 AI 回應的狀態

// 使用說明彈窗相關
const GUIDE_STORAGE_KEY = 'chatview-guide-shown'
const showGuideDialog = ref(false)
const dontShowAgain = ref(false)
const isWelcomeGuideVisible = inject('isWelcomeGuideVisible', ref(false))
const isActive = ref(false)
const route = useRoute()

const debugState = (tag: string) => {
  try {
    console.log('[ChatView][' + tag + ']', {
      isActive: isActive.value,
      route: route?.name,
      isWelcomeGuideVisible: (isWelcomeGuideVisible as any)?.value ?? isWelcomeGuideVisible,
      hasShownGuide: !!localStorage.getItem(GUIDE_STORAGE_KEY),
      showGuideDialog: showGuideDialog.value
    })
  } catch { /* noop */ }
}

const checkAndShowGuide = () => {
  // 確保組件處於活動狀態、路由正確且全局歡迎導覽已關閉
  debugState('checkAndShowGuide:before')
  if (!isActive.value || route.name !== 'chat' || isWelcomeGuideVisible.value) return
  
  // 優先處理 WelcomeGuide 轉場後的一次性強制顯示
  try {
    const pending = sessionStorage.getItem('pendingChildGuide')
    if (pending === 'chat') {
      if (!showGuideDialog.value) showGuideDialog.value = true
      sessionStorage.removeItem('pendingChildGuide')
      debugState('forced-by-pendingChildGuide')
      return
    }
  } catch { /* noop */ }

  const hasShownGuide = localStorage.getItem(GUIDE_STORAGE_KEY)
  if (!hasShownGuide) {
    if (!showGuideDialog.value) {
      showGuideDialog.value = true
    }
    debugState('checkAndShowGuide:after-show')
  }
}

// 監聽全局導覽關閉事件
watch(isWelcomeGuideVisible, (newValue) => {
  if (!newValue) {
    nextTick(() => {
      debugState('welcome-closed')
      checkAndShowGuide()
    })
  }
})

// 檢查是否首次訪問
onActivated(() => {
  isActive.value = true
  debugState('onActivated')
  checkAndShowGuide()
  // 再保險：延時再次檢查，避免事件順序造成誤失敗
  setTimeout(() => {
    debugState('onActivated:retry-200ms')
    checkAndShowGuide()
  }, 200)
})

onDeactivated(() => {
  isActive.value = false
})

// 監聽路由名稱切換到 chat 時再嘗試一次
watch(() => route.name, (n) => {
  if (n === 'chat') {
    nextTick(() => {
      debugState('route-changed-to-chat')
      checkAndShowGuide()
      setTimeout(() => {
        debugState('route-changed-to-chat:retry-150ms')
        checkAndShowGuide()
      }, 150)
    })
  }
})

// 關閉使用說明
const closeGuide = () => {
  if (dontShowAgain.value) {
    localStorage.setItem(GUIDE_STORAGE_KEY, 'true')
  }
  showGuideDialog.value = false
}

const avatarAI = new URL('../assets/avatar-ai.svg', import.meta.url).href
const avatarUser = 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png'

// 使用改進的滾動邏輯
const { forceScroll, forceScrollToLatestMessage } = useScrollToBottom(messagesContainer)

// 移除自動 watch，改為手動控制滾動時機

// 比較兩個 LoanInput 是否相同
const isFormDataEqual = (data1: LoanInput | null, data2: LoanInput | null): boolean => {
  if (data1 === null && data2 === null) return true
  if (data1 === null || data2 === null) return false
  
  // 比較所有欄位
  return JSON.stringify(data1) === JSON.stringify(data2)
}

// 處理表單數據更新
const handleFormDataUpdate = (formData: LoanInput) => {
  console.log('=== handleFormDataUpdate 被觸發 ===')
  console.log('接收到的 formData:', formData)
  
  currentFormData.value = formData
  
  console.log('currentFormData 已更新為:', currentFormData.value)
  console.log('表單數據已更新,將在下次聊天時使用')
}

interface SendPayload { text: string; files: ChatFile[] }
const handleSend = async (content: SendPayload) => {
  if (!content.text && !content.files.length) return
  // 判斷是否有新表單數據
  const hasFormDataChanged = !isFormDataEqual(currentFormData.value, lastSentFormData.value)
  let formSnapshotId: string | undefined
  if (hasFormDataChanged && currentFormData.value) {
    formSnapshotId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`
    formSnapshots.value[formSnapshotId] = currentFormData.value
  }

  const userMsg: ExtendedChatMessage = {
    id: Date.now() + '-user',
    type: 'user',
    content: { text: content.text, files: content.files || [], meta: formSnapshotId ? { formSnapshotId } : undefined },
    timestamp: new Date(),
    avatar: avatarUser
  }
  messages.value.push(userMsg)
  
  // 情境 1：用戶發送訊息 → 強制滾動
  forceScroll()
  
  // 開始等待狀態
  isWaitingResponse.value = true

  try {
    
    // 只有在 form_data 有變更時才發送,否則發送 null
    const formDataToSend = hasFormDataChanged ? currentFormData.value : null
    
    // 準備 API 請求
    const chatRequest: ChatRequest = {
      session_id: sessionId.value,
      message: content.text,
      form_data: formDataToSend, // 只在數據有變更時發送
      bank_id: 'DEFAULT'
    }

    console.log('=== 發送 Chat 請求 ===')
    console.log('Session ID:', chatRequest.session_id)
    console.log('Message:', chatRequest.message)
    console.log('Form Data 是否變更:', hasFormDataChanged)
    console.log('Form Data:', formDataToSend ? '已提供 (有變更)' : currentFormData.value ? '未提供 (無變更)' : '未提供 (無數據)')
    if (formDataToSend) {
      console.log('Form Data 內容:', JSON.stringify(formDataToSend, null, 2))
    }

    // 調用 Chat API
    const response = await chatWithAI(chatRequest)

    // 如果成功發送了 form_data,更新 lastSentFormData
    if (formDataToSend) {
      lastSentFormData.value = formDataToSend
      console.log('已更新 lastSentFormData,下次發送相同數據將不帶入 form_data')
    }

    // 創建 AI 回應消息
    // 只有在有 form_data 的情況下才顯示 prediction 和 suggested_questions
    const aiMsg: ExtendedChatMessage = {
      id: Date.now() + '-ai',
      type: 'ai',
      content: { 
        text: response.reply,
        files: [],
        prediction: formDataToSend ? (response.prediction || null) : null,
        suggested_questions: formDataToSend ? (response.suggested_questions || null) : null
      },
      timestamp: new Date(),
      avatar: avatarAI
    }
    messages.value.push(aiMsg)
    
    // 判斷是否為長訊息
    const isLongMessage = (
      // 包含 prediction 資料卡
      (aiMsg.content.prediction !== null && aiMsg.content.prediction !== undefined) ||
      // 包含建議問題清單
      (aiMsg.content.suggested_questions && aiMsg.content.suggested_questions.length > 0) ||
      // 包含列表元素（ol/li）
      (response.reply && (response.reply.includes('<ol') || response.reply.includes('<li') || response.reply.includes('1.') || response.reply.includes('- ')))
    )
    
    // 情境 2：AI 回覆 → 根據訊息長度決定捲動方式
    if (isLongMessage) {
      // 長訊息：捲動到訊息頂部，讓使用者從開頭閱讀
      forceScrollToLatestMessage()
    } else {
      // 短訊息：捲動到底部
      forceScroll()
    }

    // 如果有預測結果,記錄到 console
    if (response.prediction) {
      const riskText = {
        LOW: '低風險',
        MEDIUM: '中風險',
        HIGH: '高風險'
      }[response.prediction.risk_level]
      
      console.log('風險預測:', {
        風險等級: riskText,
        還款機率: `${(response.prediction.probability * 100).toFixed(2)}%`,
        決策標籤: response.prediction.decision_label,
        重要特徵: response.prediction.shap_top_features
      })
    }

    // 如果有推薦問題,也可以顯示
    if (response.suggested_questions && response.suggested_questions.length > 0) {
      console.log('推薦問題:', response.suggested_questions)
    }

  } catch (error) {
    console.error('聊天 API 調用失敗:', error)
    ElMessage.error('無法連接到 AI 服務,請稍後再試')
    
    // 顯示錯誤消息
    const errorMsg: ExtendedChatMessage = {
      id: Date.now() + '-ai-error',
      type: 'ai',
      content: { 
        text: '抱歉,我現在無法回應您的問題,請稍後再試。',
        files: [] 
      },
      timestamp: new Date(),
      avatar: avatarAI
    }
    messages.value.push(errorMsg)
  } finally {
    // 結束等待狀態
    isWaitingResponse.value = false
  }
}

// 顯示表單快照 Dialog
const showFormSnapshot = (id: string) => {
  activeSnapshotId.value = id
  showFormSnapshotDialog.value = true
}

// 處理建議問題點擊
const handleSuggestedQuestion = (question: string) => {
  if (isWaitingResponse.value) return
  // 直接發送問題,不顯示在輸入框
  handleSend({ text: question, files: [] })
}

// 格式化展示：千分位、百分比等
const formatCurrency = (n: number | string): string => {
  const num = Number(n)
  if (isNaN(num)) return String(n)
  return num.toLocaleString('en-US')
}
const formatCurrencyWithUSD = (n: number | string): string => {
  const formatted = formatCurrency(n)
  return formatted
}
const formatPercent = (n: number | string): string => {
  const num = Number(n)
  if (isNaN(num)) return String(n)
  return `${num}%`
}

// 分組顯示的欄位鍵
const snapshotGroups: Array<{ title: string; keys: string[] }> = [
  { title: '基本資訊', keys: ['loan_amnt','term','int_rate','installment','purpose','issue_d','grade','sub_grade','application_type','home_ownership','emp_length','annual_inc'] },
  { title: '信用資料', keys: ['earliest_cr_line','open_acc','total_acc','pub_rec','pub_rec_bankruptcies','mort_acc'] },
  { title: '額度與比例', keys: ['dti','revol_bal','revol_util'] },
]
</script>

<style scoped>
/* 同原檔樣式（略） */
.chat-view { position: relative; display: flex; flex-direction: column; height: 100%; width: 100%; padding: 12px; gap: 12px; overflow: hidden; }
/* macOS 風格動態背景 */
.macos-animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  background: #f5f7fa;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
  animation: float 25s infinite ease-in-out alternate;
}

.blob-1 {
  top: -10%;
  left: -10%;
  width: 50vw;
  height: 50vw;
  background: #007AFF; /* macOS Blue */
  animation-delay: 0s;
}

.blob-2 {
  bottom: -10%;
  right: -10%;
  width: 60vw;
  height: 60vw;
  background: #5AC8FA; /* macOS Cyan */
  animation-delay: -5s;
  opacity: 0.12;
}

.blob-3 {
  top: 30%;
  left: 30%;
  width: 40vw;
  height: 40vw;
  background: #5856D6; /* macOS Indigo */
  opacity: 0.08;
  animation-delay: -10s;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
}

.chat-card { 
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: var(--text-color); 
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  border-radius: 16px; 
  padding: 12px;
  flex: 1;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.title { 
  font-size: 19px; 
  font-weight: 500; 
  margin: -12px -12px 16px -12px;
  padding: 14px 16px;
  color: var(--text-color);
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(249, 249, 249, 0.9));
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px 8px 0 0;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  letter-spacing: 0.2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.title-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.help-icon {
  font-size: 20px;
  color: var(--text-color);
  opacity: 0.5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.help-icon:hover {
  opacity: 1;
  transform: scale(1.1);
  color: #007AFF;
}

.title:hover {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.85), rgba(250, 250, 250, 0.95));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.title-icon {
  font-size: 20px;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.title-text {
  font-weight: 500;
  background: linear-gradient(135deg, #1d1d1f 0%, #424245 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.messages-container { 
  flex: 1;
  overflow-y: auto; 
  overflow-x: hidden; 
  padding: 8px; 
  display: flex; 
  flex-direction: column; 
  position: relative;
  z-index: 1;
}
.message-fade-enter-active, .message-fade-leave-active { transition: opacity 0.5s; }
.message-fade-enter-from, .message-fade-leave-to { opacity: 0; }

/* 等待動畫 */
.typing { 
  display: flex; 
  gap: 6px; 
  padding: 8px 12px; 
  opacity: 0.8;
  align-items: center;
}

.dot { 
  width: 6px; 
  height: 6px; 
  border-radius: 50%; 
  background: var(--text-color); 
  animation: blink 1.2s infinite ease-in-out; 
}

.dot:nth-child(2) { 
  animation-delay: 0.15s; 
}

.dot:nth-child(3) { 
  animation-delay: 0.3s; 
}

@keyframes blink { 
  0%, 80%, 100% { 
    opacity: 0.2; 
  } 
  40% { 
    opacity: 0.9; 
  } 
}

/* ChatInput 組件樣式 */
:deep(.chat-input) {
  position: relative;
  z-index: 1;
}

/* 使用說明彈窗樣式 */
:deep(.guide-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.guide-dialog .el-dialog__header) {
  display: none;
}

:deep(.guide-dialog .el-dialog__body) {
  padding: 0;
}

.guide-content {
  padding: 32px 28px 24px;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.03) 0%, rgba(10, 132, 255, 0.05) 100%);
}

.guide-header {
  text-align: center;
  margin-bottom: 28px;
}

.guide-icon {
  font-size: 48px;
  margin-bottom: 12px;
  animation: bounceIn 0.6s ease;
}

.guide-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
  letter-spacing: 0.5px;
}

.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.step-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: var(--card-bg);
  border: 1px solid rgba(0, 122, 255, 0.15);
  border-radius: 12px;
  transition: all 0.3s ease;
  animation: slideInUp 0.4s ease forwards;
  opacity: 0;
}

.step-card:nth-child(1) { animation-delay: 0.1s; }
.step-card:nth-child(2) { animation-delay: 0.2s; }
.step-card:nth-child(3) { animation-delay: 0.3s; }
.step-card:nth-child(4) { animation-delay: 0.4s; }

.step-card:hover {
  border-color: rgba(0, 122, 255, 0.35);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.15);
}

.step-number {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #007AFF 0%, #0A84FF 100%);
  color: white;
  font-size: 16px;
  font-weight: 700;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 6px 0;
}

.step-desc {
  font-size: 13px;
  color: var(--text-color);
  opacity: 0.75;
  margin: 0;
  line-height: 1.5;
}

.guide-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 122, 255, 0.1);
}

.got-it-btn {
  min-width: 120px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.25);
  transition: all 0.3s ease;
}

.got-it-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.35);
}

.got-it-btn:active {
  transform: translateY(0);
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
<style scoped>
/* 授信審查資訊 Dialog 樣式優化（macOS 風格） */
:deep(.snapshot-dialog .el-dialog__header){
  background: linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(249,249,249,0.95));
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
}
:deep(.snapshot-dialog .el-dialog__title){
  font-weight: 600;
  letter-spacing: 0.2px;
}
.snapshot-content{ padding: 8px 4px 4px; }
.snapshot-header{
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  margin: 4px 0 10px;
  opacity: 0.85;
}
:deep(.snapshot-descriptions){
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
:deep(.snapshot-descriptions .el-descriptions__body){
  padding: 8px;
}
:deep(.el-descriptions__label){
  font-weight: 500;
}

/* 金額顯示樣式 */
.currency-value {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.currency-number {
  font-weight: 500;
  color: var(--text-color);
}

.currency-unit {
  font-size: 0.85em;
  color: #999;
  font-weight: 400;
  letter-spacing: 0.3px;
}
</style>
