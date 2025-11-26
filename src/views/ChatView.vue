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
    <div class="main-content">
      <div ref="messagesContainer" class="messages-container">
        <transition-group name="message-fade" tag="div">
          <ChatMessage
            v-for="(msg, index) in messages"
            :key="msg.id"
            :message="msg"
          />
        </transition-group>
        <div v-if="isWaitingResponse" class="typing">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
      <ChatInput @send="handleSend" @form-data-update="handleFormDataUpdate" />
    </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInput from '@/components/ChatInput.vue'
import type { ChatMessage as ChatMessageType, ChatFile } from '@/types/chat'
import { chatWithAI } from '@/services/lendingClubApi'
import type { ChatRequest, LoanInput } from '@/types/api'
import { ElMessage } from 'element-plus'

interface ExtendedChatMessage extends ChatMessageType { avatar?: string }

const messages = ref<ExtendedChatMessage[]>([])
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

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(messages, () => { scrollToBottom() })

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
  
  const userMsg: ExtendedChatMessage = {
    id: Date.now() + '-user',
    type: 'user',
    content: { text: content.text, files: content.files || [] },
    timestamp: new Date(),
    avatar: avatarUser
  }
  messages.value.push(userMsg)
  
  // 開始等待狀態
  isWaitingResponse.value = true

  try {
    // 檢查 form_data 是否有變更
    const hasFormDataChanged = !isFormDataEqual(currentFormData.value, lastSentFormData.value)
    
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
</script>

<style scoped>
/* 同原檔樣式（略） */
.chat-view { position: relative; display: flex; flex-direction: column; height: 100%; width: 100%; padding: 20px; gap: 12px; overflow: hidden; }
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

.main-content { position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; width: 100%; gap: 12px; }
.messages-container { flex-grow: 1; overflow-y: auto; overflow-x: hidden; padding: 10px; border: 1px solid var(--border-color); border-radius: 4px; display: flex; flex-direction: column; }
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
