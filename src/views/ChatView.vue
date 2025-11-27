<template>
  <div class="chat-view">
    <!-- 動畫背景 -->
    <div class="animated-background">
      <div class="glow-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="orb orb-4"></div>
        <div class="orb orb-5"></div>
        <div class="orb orb-6"></div>
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="orb orb-4"></div>
        <div class="orb orb-5"></div>
        <div class="orb orb-6"></div>
      </div>
    </div>

    <!-- 主要內容 -->
    <div class="chat-card">
      <h2 class="title">
        <span class="title-icon">💳</span>
        <span class="title-text">智能貸款評估</span>
      </h2>
      <div ref="messagesContainer" class="messages-container">
        <transition-group name="message-fade" tag="div">
          <ChatMessage
            v-for="(msg, index) in messages"
            :key="msg.id"
            :message="msg"
            @show-form="showFormSnapshot"
          />
        </transition-group>
        <div v-if="isWaitingResponse" class="typing">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>
    <ChatInput @send="handleSend" @form-data-update="handleFormDataUpdate" />

    <!-- 使用說明彈窗 -->
    <el-dialog
      v-model="showGuideDialog"
      title=""
      width="520px"
      :show-close="false"
      class="guide-dialog"
      align-center
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
                <span>
                  {{
                    key === 'loan_amnt' || key === 'installment' || key === 'annual_inc' || key === 'revol_bal'
                      ? formatCurrency((formSnapshots[activeSnapshotId] as any)[key])
                      : key === 'int_rate' || key === 'revol_util' || key === 'dti'
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
import { ref, watch, nextTick, onMounted } from 'vue'
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
  revol_util: '循環使用率',
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

// 檢查是否首次訪問
onMounted(() => {
  const hasShownGuide = localStorage.getItem(GUIDE_STORAGE_KEY)
  if (!hasShownGuide) {
    showGuideDialog.value = true
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
const { forceScroll } = useScrollToBottom(messagesContainer)

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

    // 創建 AI 回應消息,包含 prediction 數據
    const aiMsg: ExtendedChatMessage = {
      id: Date.now() + '-ai',
      type: 'ai',
      content: { 
        text: response.reply,
        files: [],
        prediction: response.prediction || null
      },
      timestamp: new Date(),
      avatar: avatarAI
    }
    messages.value.push(aiMsg)
    
    // 情境 2：AI 回覆 → 永遠滾動
    forceScroll()

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

// 格式化展示：千分位、百分比等
const formatCurrency = (n: number | string): string => {
  const num = Number(n)
  if (isNaN(num)) return String(n)
  return num.toLocaleString('en-US')
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
.animated-background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; overflow: hidden; }
.glow-orbs { position: absolute; width: 100%; height: 100%; top: 0; left: 0; }
.orb { position: absolute; border-radius: 50%; filter: blur(50px); opacity: 0.5; }
.orb-1 { width: 400px; height: 400px; top: 10%; left: 15%; background: radial-gradient(circle, rgba(124, 58, 237, 0.5) 0%, rgba(124, 58, 237, 0.3) 30%, rgba(124, 58, 237, 0.15) 50%, rgba(124, 58, 237, 0.05) 70%, transparent 100%); animation: orbFloat1 9.6s ease-in-out infinite; }
.orb-2 { width: 350px; height: 350px; top: 60%; right: 20%; background: radial-gradient(circle, rgba(147, 51, 234, 0.45) 0%, rgba(147, 51, 234, 0.28) 30%, rgba(147, 51, 234, 0.14) 50%, rgba(147, 51, 234, 0.05) 70%, transparent 100%); animation: orbFloat2 12s ease-in-out infinite; animation-delay: -4s; filter: blur(55px); }
.orb-3 { width: 300px; height: 300px; bottom: 15%; left: 40%; background: radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.25) 30%, rgba(168, 85, 247, 0.12) 50%, rgba(168, 85, 247, 0.04) 70%, transparent 100%); animation: orbFloat3 8s ease-in-out infinite; animation-delay: -6.4s; filter: blur(60px); }
.orb-4 { width: 280px; height: 280px; top: 35%; left: 60%; background: radial-gradient(circle, rgba(139, 92, 246, 0.38) 0%, rgba(139, 92, 246, 0.22) 30%, rgba(139, 92, 246, 0.11) 50%, rgba(139, 92, 246, 0.04) 70%, transparent 100%); animation: orbFloat1 11.2s ease-in-out infinite; animation-delay: -2.4s; filter: blur(45px); }
.orb-5 { width: 320px; height: 320px; top: 75%; left: 10%; background: radial-gradient(circle, rgba(156, 39, 176, 0.35) 0%, rgba(156, 39, 176, 0.2) 30%, rgba(156, 39, 176, 0.1) 50%, rgba(156, 39, 176, 0.03) 70%, transparent 100%); animation: orbFloat2 10.4s ease-in-out infinite; animation-delay: -8s; filter: blur(52px); }
.orb-6 { width: 260px; height: 260px; top: 45%; right: 15%; background: radial-gradient(circle, rgba(124, 58, 237, 0.32) 0%, rgba(124, 58, 237, 0.18) 30%, rgba(124, 58, 237, 0.09) 50%, rgba(124, 58, 237, 0.03) 70%, transparent 100%); animation: orbFloat3 8.8s ease-in-out infinite; animation-delay: -4.8s; filter: blur(48px); }
@keyframes orbFloat1 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; } 25% { transform: translate(50px, -60px) scale(1.15); opacity: 0.7; } 50% { transform: translate(-40px, 40px) scale(0.85); opacity: 0.4; } 75% { transform: translate(30px, 50px) scale(1.05); opacity: 0.6; } }
@keyframes orbFloat2 { 0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0.5; } 33% { transform: translate(-45px, 55px) scale(1.12); opacity: 0.65; } 66% { transform: translate(35px, -45px) scale(0.88); opacity: 0.45; } }
@keyframes orbFloat3 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; } 20% { transform: translate(40px, 30px) scale(1.08); opacity: 0.6; } 40% { transform: translate(-30px, -50px) scale(0.92); opacity: 0.7; } 60% { transform: translate(25px, -35px) scale(1.1); opacity: 0.55; } 80% { transform: translate(-35px, 45px) scale(0.95); opacity: 0.45; } }

.chat-card { 
  position: relative;
  z-index: 1;
  background: var(--card-bg); 
  color: var(--text-color); 
  border: 1px solid var(--border-color); 
  border-radius: 8px; 
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
  gap: 10px;
  letter-spacing: 0.2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

/* 深色模式標題樣式 */
:global(.dark) .title {
  background: linear-gradient(to bottom, rgba(50, 50, 52, 0.7), rgba(44, 44, 46, 0.8));
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

:global(.dark) .title:hover {
  background: linear-gradient(to bottom, rgba(55, 55, 57, 0.75), rgba(48, 48, 50, 0.85));
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

:global(.dark) .title-text {
  background: linear-gradient(135deg, #f5f5f7 0%, #d1d1d6 100%);
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
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.03) 0%, rgba(147, 51, 234, 0.05) 100%);
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
  border: 1px solid rgba(124, 58, 237, 0.15);
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
  border-color: rgba(124, 58, 237, 0.35);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
}

.step-number {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
  color: white;
  font-size: 16px;
  font-weight: 700;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
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
  border-top: 1px solid rgba(124, 58, 237, 0.1);
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

/* 深色模式優化 */
:global(.dark) .guide-content {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(147, 51, 234, 0.1) 100%);
}

:global(.dark) .step-card {
  border-color: rgba(124, 58, 237, 0.25);
}

:global(.dark) .step-card:hover {
  border-color: rgba(124, 58, 237, 0.45);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
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
:global(.dark) :deep(.snapshot-dialog .el-dialog__header){
  background: linear-gradient(to bottom, rgba(50,50,52,0.7), rgba(44,44,46,0.82));
  border-bottom-color: rgba(255,255,255,0.12);
}
</style>
