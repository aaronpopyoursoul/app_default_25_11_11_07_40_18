<template>
  <div class="csr-view">
    <!-- macOS 風格動態背景 -->
    <div class="macos-animated-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <div class="chat-card">
      <h2 class="title">
        <div class="title-content">
          <span class="title-icon">📋</span>
          <span class="title-text">人才技能量化及精準洞察系統</span>
        </div>
        <el-icon class="help-icon" @click="showGuideDialog = true"><QuestionFilled /></el-icon>
      </h2>
      <div ref="messagesContainer" class="messages-container">
        <transition-group name="message-fade" tag="div">
          <ChatMessage 
            v-for="m in messages" 
            :key="m.id" 
            :ref="el => setMessageRef(m.id, el)"
            :message="m" 
            @download-report="handleDownloadReport"
          />
        </transition-group>
        <LoadingStatus v-if="isAnalyzing" type="resume" />
      </div>
    </div>
    <div class="form-card">
      <div class="compact-form">
        <!-- 主要區域：上傳區 50% + 配置執行區 50% -->
        <div class="main-sections-row">
          <!-- 檔案上傳區：JD 與 Resume 橫向並排 -->
          <div class="upload-section">
            <div class="upload-row">
              <div class="file-upload-area" :class="{ 'has-file': jdFile }" @click="triggerFile('jd')">
                <input ref="jdInput" type="file" accept=".doc,.docx,.txt" class="hidden-input" @change="onFileChange($event, 'jd')" />
                <div v-if="!jdFile" class="upload-placeholder">
                  <el-icon class="upload-icon"><Upload /></el-icon>
                  <span class="upload-hint">點擊選擇 JD 檔案</span>
                </div>
                <div v-else class="file-preview" @click.stop>
                  <div class="file-info">
                    <span class="file-icon">📄</span>
                    <div class="file-details">
                      <span class="file-name-display" :title="jdFile.name">{{ jdFile.name }}</span>
                      <span class="file-size">{{ formatFileSize(jdFile.size) }}</span>
                    </div>
                  </div>
                  <el-icon class="delete-icon" @click.stop="clearFile('jd')">
                    <component :is="'Close'" />
                  </el-icon>
                </div>
              </div>
              <div class="file-upload-area" :class="{ 'has-file': resumeFile }" @click="triggerFile('resume')">
                <input ref="resumeInput" type="file" accept=".doc,.docx,.txt" class="hidden-input" @change="onFileChange($event, 'resume')" />
                <div v-if="!resumeFile" class="upload-placeholder">
                  <el-icon class="upload-icon"><Upload /></el-icon>
                  <span class="upload-hint">點擊選擇 Resume 檔案</span>
                </div>
                <div v-else class="file-preview" @click.stop>
                  <div class="file-info">
                    <span class="file-icon">📄</span>
                    <div class="file-details">
                      <span class="file-name-display" :title="resumeFile.name">{{ resumeFile.name }}</span>
                      <span class="file-size">{{ formatFileSize(resumeFile.size) }}</span>
                    </div>
                  </div>
                  <el-icon class="delete-icon" @click.stop="clearFile('resume')">
                    <component :is="'Close'" />
                  </el-icon>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 配置執行區：選擇器 + 按鈕組合 -->
          <div class="config-action-section">
            <!-- 選擇器區 -->
            <div class="selector-section">
              <div class="selector-row">
                <div class="selector-item">
                  <label class="compact-label">Model</label>
                  <ModelSelector v-model="model" :options="modelOptions" class="full-width-selector" />
                </div>
                <div class="selector-item">
                  <label class="compact-label">Version</label>
                  <el-select v-model="version" size="small" class="version-select" placeholder="請選擇版本">
                    <el-option v-for="v in versions" :key="v.value" :label="v.label" :value="v.value" />
                  </el-select>
                </div>
              </div>
            </div>
            
            <!-- 按鈕區 -->
            <div class="action-section">
              <el-button type="primary" size="large" :loading="isAnalyzing" :disabled="!canAnalyze" @click="startAnalyze" class="analyze-btn">
                <el-icon v-if="!isAnalyzing" style="margin-right: 4px;"><DataAnalysis /></el-icon>
                {{ isAnalyzing ? '分析中...' : '開始分析' }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

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
          <h2 class="guide-title">CSR 智能履歷評估 - 使用說明</h2>
        </div>

        <div class="guide-steps">
          <div class="step-card">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3 class="step-title">上傳 JD 文件</h3>
              <p class="step-desc">選擇上傳 JD 文件(格式：docx/txt)</p>
            </div>
          </div>

          <div class="step-card">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3 class="step-title">上傳 Resume 文件</h3>
              <p class="step-desc">選擇上傳 Resume 文件(格式：docx/txt)</p>
            </div>
          </div>

          <div class="step-card">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3 class="step-title">開始分析</h3>
              <p class="step-desc">按下「開始分析」按鈕進行評估</p>
            </div>
          </div>

          <div class="step-card">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3 class="step-title">查看輸出內容</h3>
              <p class="step-desc">檢視 AI 生成的履歷評估結果</p>
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
import { ref, computed, onMounted, onActivated, onDeactivated, inject, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Upload, DataAnalysis, Close, QuestionFilled } from '@element-plus/icons-vue'
import ModelSelector from '@/components/ModelSelector.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import LoadingStatus from '@/components/LoadingStatus.vue'
import { MODEL_OPTIONS } from '@/constants/models'
import { useScrollToBottom } from '@/hooks/useScrollToBottom'
import { useNotifier } from '@/hooks/useNotifier'
import { analyzeCsr } from '@/hooks/useCsrApi'
import type { CsrApiResponse } from '@/types/csr'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import { generateCsrReportDocx } from '@/utils/docxGenerator'
import { ElMessage } from 'element-plus'

// 設定組件名稱以支援 KeepAlive
defineOptions({
  name: 'CsrResumeView'
})

// 使用說明彈窗相關
const GUIDE_STORAGE_KEY = 'csrresumeview-guide-shown'
const showGuideDialog = ref(false)
const dontShowAgain = ref(false)
const isWelcomeGuideVisible = inject('isWelcomeGuideVisible', ref(false))
const isActive = ref(false)
const route = useRoute()

const debugState = (tag: string) => {
  try {
    console.log('[CsrResumeView][' + tag + ']', {
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
  if (!isActive.value || route.name !== 'csr' || isWelcomeGuideVisible.value) return

  // 優先處理 WelcomeGuide 轉場後的一次性強制顯示
  try {
    const pending = sessionStorage.getItem('pendingChildGuide')
    if (pending === 'csr') {
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
  setTimeout(() => {
    debugState('onActivated:retry-200ms')
    checkAndShowGuide()
  }, 200)
})

onDeactivated(() => {
  isActive.value = false
})

// 監聽路由切換到 csr 再嘗試一次
watch(() => route.name, (n) => {
  if (n === 'csr') {
    nextTick(() => {
      debugState('route-changed-to-csr')
      checkAndShowGuide()
      setTimeout(() => {
        debugState('route-changed-to-csr:retry-150ms')
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

const jdInput = ref<HTMLInputElement | null>(null)
const resumeInput = ref<HTMLInputElement | null>(null)
const jdFile = ref<File | null>(null)
const resumeFile = ref<File | null>(null)
// 使用集中模型常數（保留 icon 與 description）
const modelOptions = MODEL_OPTIONS
const model = ref(modelOptions[0].value)
const versions = [
  { label: '1.1', value: '1.1' },
  { label: '2.0(RAG)', value: '2.0' }
]
const version = ref('1.1')
const isAnalyzing = ref(false)
const messages = ref<ChatMessageType[]>([])
const messagesContainer = ref<HTMLElement | null>(null)
const { forceScroll, forceScrollToLatestMessage } = useScrollToBottom(messagesContainer)
const { notifyError } = useNotifier()
const canAnalyze = computed(() => !!jdFile.value && !!resumeFile.value)

// 移除自動 watch，改為手動控制滾動時機

function triggerFile(type: 'jd' | 'resume') { (type === 'jd' ? jdInput.value : resumeInput.value)?.click() }
function onFileChange(e: Event, type: 'jd' | 'resume') {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!/\.(docx?|txt)$/i.test(file.name)) {
    notifyError('僅支援 .doc/.docx 或 .txt 格式')
    input.value = ''
    return
  }
  if (type === 'jd') jdFile.value = file; else resumeFile.value = file
}

// 清除檔案
function clearFile(type: 'jd' | 'resume') {
  if (type === 'jd') {
    jdFile.value = null
    if (jdInput.value) jdInput.value.value = ''
  } else {
    resumeFile.value = null
    if (resumeInput.value) resumeInput.value.value = ''
  }
}

// 格式化檔案大小
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 清理 Markdown 代碼塊標記
function cleanMarkdownCodeBlocks(text: string): string {
  if (!text) return text
  
  // 移除各種代碼塊標記：```html, ```HTML, ```, 包含可能的換行
  let cleaned = text.replace(/```html\s*/gi, '')
  cleaned = cleaned.replace(/```HTML\s*/g, '')
  cleaned = cleaned.replace(/```\s*/g, '')
  
  // 移除可能的前後空白
  cleaned = cleaned.trim()
  
  return cleaned
}

async function startAnalyze() {
  if (!canAnalyze.value || !jdFile.value || !resumeFile.value) return
  isAnalyzing.value = true

  // 使用者起始訊息（美觀排版：JD、Resume、模型｜版本）
  messages.value.push({
    id: Date.now() + '-user',
    type: 'user',
    content: {
      text: `JD：${jdFile.value.name}\nResume：${resumeFile.value.name}\n模型：${model.value}｜版本：${version.value}`,
      files: []
    },
    timestamp: new Date()
  })
  
  // 用戶發送訊息 → 強制滾動
  forceScroll()

  try {
    const data: CsrApiResponse = await analyzeCsr({
      jdFile: jdFile.value,
      resumeFile: resumeFile.value,
      aiModel: model.value,
      appVersion: version.value
    })
    
    // 1) Answer：僅顯示主要分析文字（支援 HTML，清理 Markdown 標記）
    let answerText = (data.answer && data.answer.trim().length) ? data.answer : '（無分析內容）'
    answerText = cleanMarkdownCodeBlocks(answerText)
    
    const answerMessageId = Date.now() + '-ai-answer'
    messages.value.push({
      id: answerMessageId,
      type: 'ai',
      content: { 
        text: answerText, 
        files: [], 
        meta: { isHtml: true, messageKind: 'answer' } 
      },
      timestamp: new Date()
    })

    // 2) Result：獨立一則訊息；若缺則提示（直接展開，不折疊）
    if (data.result !== undefined && data.result !== null) {
      let fullResult: string
      if (typeof data.result === 'object') {
        fullResult = JSON.stringify(data.result, null, 2)
      } else {
        fullResult = String(data.result)
      }
      messages.value.push({
        id: Date.now() + '-ai-result',
        type: 'ai',
        content: {
          text: fullResult,
          files: [],
          meta: { messageKind: 'result' }
        },
        timestamp: new Date()
      })
    } else {
      messages.value.push({
        id: Date.now() + '-ai-result-missing',
        type: 'ai',
        content: { text: '此版本暫無詳細 Result 資料。', files: [] },
        timestamp: new Date()
      })
    }
    
    // 情境 3：多段訊息 → 等所有訊息加入後，滾動到 answer 訊息的開頭
    nextTick(() => {
      nextTick(() => {
        requestAnimationFrame(() => {
          const container = messagesContainer.value
          if (!container) return
          
          // 使用 data attribute 精確找到 answer 訊息
          const answerMessages = container.querySelectorAll('.chat-message[data-message-kind="answer"]')
          const answerMessageElement = answerMessages[answerMessages.length - 1] as HTMLElement
          
          if (answerMessageElement) {
            const messageTop = answerMessageElement.offsetTop
            const offset = 80
            
            console.log('滾動到 answer 訊息:', messageTop, 'offset:', offset)
            
            container.scrollTo({
              top: Math.max(0, messageTop - offset),
              behavior: 'smooth'
            })
          } else {
            // Fallback: 使用原有方法
            console.warn('找不到 answer 訊息,使用 fallback')
            forceScrollToLatestMessage()
          }
        })
      })
    })

    // 3) Usage & Info：
    const formatUsd = (v: any) => {
      const n = Number(v)
      if (Number.isNaN(n)) return '$-'
      return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 6, maximumFractionDigits: 6 })
    }
    const usageLines = data.usage
      ? `Input tokens: ${data.usage.input_tokens ?? '-'}\nOutput tokens: ${data.usage.output_tokens ?? '-'}\nTotal cost: ${formatUsd(data.usage.total_cost)}`
      : '（無使用量資訊）'
    const infoLines = data.info
      ? `模型：${data.info.aiModel ?? model.value}\n版本：${data.info.appVersion ?? version.value}\nJD：${data.info.jd_file ?? jdFile.value.name}\nResume：${data.info.resume_file ?? resumeFile.value.name}`
      : '（無附加資訊）'
    messages.value.push({
      id: Date.now() + '-ai-usage-info',
      type: 'ai',
      content: { 
        text: `使用量統計\n----------------\n${usageLines}\n\n分析環境資訊\n----------------\n${infoLines}`, 
        files: [],
        meta: { messageKind: 'usage-info' }
      },
      timestamp: new Date()
    })
  } catch (e: any) {
    // 推送錯誤訊息
    messages.value.push({
      id: Date.now() + '-ai-error',
      type: 'ai',
      content: { text: `分析失敗\n錯誤：${e?.message || e}`, files: [], meta: { messageKind: 'error' } },
      timestamp: new Date()
    })
    
    // 錯誤訊息也滾動
    forceScroll()
  } finally {
    isAnalyzing.value = false
  }
}

// 儲存 message 組件的引用
const messageRefs = new Map<string, any>()

function setMessageRef(messageId: string, el: any) {
  if (el) {
    messageRefs.set(messageId, el)
  }
}

// 處理下載報告
async function handleDownloadReport(messageId: string) {
  try {
    // 找到對應的 answer 訊息
    const answerMessage = messages.value.find(m => m.id === messageId && m.content.meta?.messageKind === 'answer')
    if (!answerMessage) {
      ElMessage.error('找不到分析結果')
      const messageComponent = messageRefs.get(messageId)
      if (messageComponent?.resetDownloadState) {
        messageComponent.resetDownloadState()
      }
      return
    }

    // 找到對應的 result 訊息
    const resultMessage = messages.value.find(m => m.content.meta?.messageKind === 'result')
    let resultData: any[] = []
    
    if (resultMessage && resultMessage.content.text) {
      try {
        resultData = JSON.parse(resultMessage.content.text)
      } catch {
        // 如果解析失敗，使用空陣列
        resultData = []
      }
    }

    // 生成 Word 文件
    await generateCsrReportDocx({
      jdFileName: jdFile.value?.name || 'Unknown',
      resumeFileName: resumeFile.value?.name || 'Unknown',
      model: model.value,
      version: version.value,
      timestamp: answerMessage.timestamp || new Date(),
      answer: answerMessage.content.text,
      result: resultData
    })

    // 下載完成後才顯示成功訊息
    ElMessage.success({
      message: '報告下載成功!',
      duration: 3000,
      showClose: true
    })
    
    // 重置下載按鈕狀態
    const messageComponent = messageRefs.get(messageId)
    if (messageComponent?.resetDownloadState) {
      messageComponent.resetDownloadState()
    }
  } catch (error) {
    console.error('下載報告失敗:', error)
    ElMessage.error('下載報告失敗，請稍後再試')
    
    // 發生錯誤時也要重置狀態
    const messageComponent = messageRefs.get(messageId)
    if (messageComponent?.resetDownloadState) {
      messageComponent.resetDownloadState()
    }
  }
}
</script>
<style scoped>
.csr-view { 
  position: relative;
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
  height: 100%; 
  padding: 12px; 
  overflow: hidden;
}

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

.form-card, .chat-card { 
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
  overflow: hidden; /* 防止子元素溢出 */
}

.form-card {
  flex-shrink: 0; /* 防止表單卡片被壓縮 */
  width: 100%; /* 確保寬度不超過父容器 */
  box-sizing: border-box; /* 包含 padding 和 border 在寬度計算內 */
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

/* 緊湊表單容器 */
.compact-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%; /* 確保不超出父容器 */
  box-sizing: border-box;
}

/* 主要區域並排容器：上傳區 50% + 配置執行區 50% */
.main-sections-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: stretch;
  width: 100%; /* 確保不超出父容器 */
  box-sizing: border-box;
}

/* 配置執行區：包含選擇器和按鈕 */
.config-action-section {
  display: flex;
  gap: 12px;
  align-items: stretch;
  width: 100%; /* 確保不超出父容器 */
  box-sizing: border-box;
  min-width: 0; /* 允許子元素收縮 */
}

/* 檔案上傳區段: macOS Sonoma 風格 */
.upload-section {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(248, 248, 248, 0.7));
  border: 0.5px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px) saturate(150%);
  -webkit-backdrop-filter: blur(10px) saturate(150%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 
              inset 0 1px 0 rgba(255, 255, 255, 0.8);
  width: 100%;
  box-sizing: border-box;
  min-width: 0; /* 允許收縮 */
}

.upload-section:hover {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.7), rgba(250, 250, 250, 0.8));
  border-color: rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

/* 檔案上傳區:JD 與 Resume 橫向並排 */
.upload-row {
  display: flex;
  gap: 12px;
  flex: 1;
}

/* 文件上傳區域：橫向並排 */
.file-upload-area {
  position: relative;
  flex: 1;
  min-width: 0; /* 關鍵：允許 flex 子元素收縮 */
  height: 44px;
  border: 1.5px dashed rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px; /* 減少內邊距 */
  /* 觸控優化 */
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  box-sizing: border-box;
  overflow: hidden; /* 防止溢出 */
}

/* 針對觸控設備優化點擊區域 */
@media (hover: none) and (pointer: coarse) {
  .file-upload-area {
    min-height: 48px; /* 觸控設備增加高度 */
    height: auto;
  }
  
  .analyze-btn {
    min-height: 48px; /* 觸控設備增加高度 */
  }
}

.file-upload-area:hover {
  border-color: rgba(0, 122, 255, 0.4);
  background: rgba(0, 122, 255, 0.04);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.1);
}

.file-upload-area.has-file {
  border-style: solid;
  border-color: rgba(0, 122, 255, 0.3);
  background: linear-gradient(to bottom, rgba(0, 122, 255, 0.06), rgba(0, 122, 255, 0.08));
  cursor: default;
}

.file-upload-area.has-file:hover {
  border-color: rgba(0, 122, 255, 0.4);
  background: linear-gradient(to bottom, rgba(0, 122, 255, 0.08), rgba(0, 122, 255, 0.1));
  transform: none;
}

/* 上傳佔位符：緊湊化 */
.upload-placeholder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0;
}

.upload-icon {
  font-size: 18px;
  color: rgba(0, 122, 255, 0.6);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.file-upload-area:hover .upload-icon {
  color: rgba(0, 122, 255, 0.8);
}

.upload-hint {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-color);
  opacity: 0.7;
}

/* 文件預覽：緊湊化 */
.file-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 6px; /* 減少間距 */
  flex-wrap: nowrap;
  overflow: hidden; /* 防止內容溢出 */
  min-width: 0; /* 允許 flex 子元素收縮 */
}

.file-info {
  display: flex;
  align-items: center;
  gap: 6px; /* 減少間距 */
  flex: 1;
  min-width: 0; /* 允許收縮 */
  overflow: hidden; /* 防止溢出 */
  max-width: calc(100% - 24px); /* 預留刪除按鈕空間 */
}

.file-icon {
  font-size: 16px;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.file-details {
  display: flex;
  align-items: center;
  gap: 6px; /* 減少間距 */
  min-width: 0;
  flex: 1;
  overflow: hidden; /* 確保子元素不會溢出 */
  max-width: 100%;
}

.file-name-display {
  font-size: 11px; /* 略微縮小字體 */
  font-weight: 500;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* 關鍵：自動省略號 */
  flex: 1; /* 佔據可用空間 */
  min-width: 0; /* 關鍵：允許收縮 */
  max-width: 100%;
  cursor: help; /* 顯示問號游標提示有 tooltip */
  transition: color 0.2s ease;
}

.file-name-display:hover {
  color: #007AFF; /* hover 時變色提示可查看完整名稱 */
}

.file-size {
  font-size: 9px; /* 縮小檔案大小字體 */
  color: var(--text-color);
  opacity: 0.6;
  white-space: nowrap;
  flex-shrink: 0; /* 檔案大小不被壓縮 */
  min-width: fit-content; /* 確保完整顯示 */
}

.delete-icon {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.4);
  cursor: pointer;
  padding: 3px;
  border-radius: 4px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.delete-icon:hover {
  color: #ff3b30;
  background: rgba(255, 59, 48, 0.1);
  transform: scale(1.1);
}

.hidden-input {
  display: none;
}

/* Label 樣式調整 */
.compact-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
  letter-spacing: 0.1px;
  opacity: 0.9;
  margin-bottom: 6px;
  display: block;
}

.label-icon {
  font-size: 16px;
  line-height: 1;
}

/* 選擇器區段 */
.selector-section {
  flex: 1;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.6), rgba(248, 248, 248, 0.7));
  border: 0.5px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 12px 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px) saturate(150%);
  -webkit-backdrop-filter: blur(10px) saturate(150%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04),
              inset 0 1px 0 rgba(255, 255, 255, 0.8);
  min-width: 0; /* 允許收縮 */
  box-sizing: border-box;
}

.selector-section:hover {
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.7), rgba(250, 250, 250, 0.8));
  border-color: rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

.selector-row {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0; /* 允許收縮 */
}

.selector-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0; /* 允許收縮並啟用 text-overflow */
}

/* Label 樣式 */
.compact-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
  letter-spacing: 0.1px;
  opacity: 0.9;
  display: block;
}

/* 選擇器全寬 */
.full-width-selector {
  width: 100%;
  min-width: 0; /* 允許收縮 */
  box-sizing: border-box;
}

.version-select { 
  width: 100%;
  min-width: 0; /* 允許收縮 */
  box-sizing: border-box;
}

/* 按鈕區：緊湊化 */
.action-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
  max-width: 180px; /* 限制最大寬度 */
  flex-shrink: 0; /* 防止按鈕被過度壓縮 */
  box-sizing: border-box;
}

/* macOS Sonoma 主要操作按鈕：緊湊化高度 */
.analyze-btn {
  width: 100%;
  height: 100%;
  font-size: 14px;
  font-weight: 600;
  padding: 0 20px;
  border-radius: 10px;
  border: 0.5px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(to bottom, #007AFF 0%, #0070F5 100%);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-sizing: border-box;
  /* 觸控優化 */
  min-height: 44px; /* iOS 推薦的最小觸控目標 */
  -webkit-tap-highlight-color: transparent; /* 移除 iOS 點擊高亮 */
  user-select: none; /* 防止文字選取 */
}

.analyze-btn:not(:disabled):hover {
  background: linear-gradient(to bottom, #0A84FF 0%, #0A7AFF 100%);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.35),
              inset 0 1px 0 rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
}

.analyze-btn:active {
  background: linear-gradient(to bottom, #0066EB 0%, #005CE1 100%);
  box-shadow: 0 1px 4px rgba(0, 122, 255, 0.2),
              inset 0 1px 2px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
}

/* 分析中狀態 - 使用藍色漸變保持視覺連續性 */
.analyze-btn:disabled {
  background: linear-gradient(to bottom, #5AC8FA 0%, #4AB8EA 100%);
  border-color: rgba(90, 200, 250, 0.3);
  box-shadow: 0 2px 6px rgba(90, 200, 250, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.15);
  opacity: 1; /* 保持完全不透明 */
  cursor: wait; /* 等待游標 */
  color: #FFFFFF;
  animation: pulse-analyzing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 分析中脈動動畫 */
@keyframes pulse-analyzing {
  0%, 100% {
    box-shadow: 0 2px 6px rgba(90, 200, 250, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
  50% {
    box-shadow: 0 4px 12px rgba(90, 200, 250, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
}

/* 聊天卡片 */
.chat-card { 
  flex: 1; 
  min-height: 240px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-container { 
  flex: 1;
  overflow-y: auto; 
  overflow-x: hidden; 
  padding: 8px; 
  display: flex; 
  flex-direction: column; 
}

.message-fade-enter-active, .message-fade-leave-active { 
  transition: opacity 0.3s; 
}

.message-fade-enter-from, .message-fade-leave-to { 
  opacity: 0; 
}

.typing { 
  display: flex; 
  gap: 6px; 
  padding: 8px 12px; 
  opacity: 0.8; 
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

/* 響應式：大螢幕優化 (1025px - 1280px) - 開始出現擠壓時的過渡 */
@media (max-width: 1280px) and (min-width: 1025px) {
  .main-sections-row {
    gap: 12px;
  }
  
  .selector-section {
    padding: 10px 12px;
  }
  
  .selector-row {
    gap: 10px;
  }
  
  .compact-label {
    font-size: 12px;
    margin-bottom: 5px;
  }
  
  .analyze-btn {
    font-size: 13px;
    padding: 0 16px;
  }
}

/* 響應式：中等螢幕優化 (769px - 1024px) - 改為垂直堆疊 */
@media (max-width: 1024px) and (min-width: 769px) {
  .form-card {
    padding: 12px;
  }
  
  .compact-form {
    gap: 14px;
  }
  
  /* 主要區域改為垂直堆疊 */
  .main-sections-row {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  
  /* 上傳區內的檔案改為垂直排列 */
  .upload-row {
    flex-direction: column;
    gap: 12px;
  }
  
  /* 檔案上傳框：增加高度，避免內容擠壓 */
  .file-upload-area {
    min-height: 46px;
    height: auto;
  }
  
  /* 上傳區：優化內邊距 */
  .upload-section {
    padding: 14px;
  }
  
  /* 配置執行區：橫向排列選擇器和按鈕 */
  .config-action-section {
    flex-direction: row;
    gap: 12px;
    align-items: stretch;
  }
  
  /* 選擇器區：佔據較大空間 */
  .selector-section {
    flex: 1.5;
    padding: 14px;
  }
  
  .selector-row {
    gap: 12px;
  }
  
  /* 按鈕區：固定寬度 */
  .action-section {
    min-width: 140px;
    max-width: 160px;
  }
  
  .analyze-btn {
    height: 100%;
    font-size: 14px;
    padding: 0 16px;
  }
}

/* 響應式：平板螢幕 (601px - 768px) - 完全垂直佈局 */
@media (max-width: 768px) and (min-width: 601px) {
  .csr-view {
    padding: 10px;
    gap: 12px;
  }
  
  .form-card, .chat-card {
    padding: 12px;
  }
  
  .compact-form {
    gap: 14px;
  }
  
  /* 主要區域垂直堆疊 */
  .main-sections-row {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  
  /* 上傳區：檔案垂直排列 */
  .upload-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .file-upload-area {
    min-height: 48px;
    height: auto;
    padding: 12px;
  }
  
  .upload-section {
    padding: 14px;
  }
  
  /* 配置執行區：垂直堆疊 */
  .config-action-section {
    flex-direction: column;
    gap: 12px;
  }
  
  /* 選擇器區：橫向並排 */
  .selector-section {
    padding: 14px;
  }
  
  .selector-row {
    gap: 12px;
  }
  
  .selector-item {
    flex: 1;
    min-width: 0;
  }
  
  /* 按鈕區：全寬 */
  .action-section {
    width: 100%;
    min-width: 100%;
  }
  
  .analyze-btn {
    height: 50px;
    font-size: 14px;
  }
}

/* 響應式：手機版 (< 600px) - 極致優化 */
@media (max-width: 600px) {
  .csr-view {
    padding: 8px;
    gap: 10px;
  }
  
  .form-card, .chat-card {
    padding: 10px;
  }
  
  .compact-form {
    gap: 12px;
  }
  
  /* 主要區域垂直堆疊 */
  .main-sections-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  /* 上傳區：檔案垂直排列 */
  .upload-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .file-upload-area {
    min-height: 52px;
    height: auto;
    padding: 12px;
  }
  
  .upload-hint {
    font-size: 13px;
  }
  
  .upload-icon {
    font-size: 20px;
  }
  
  .upload-section {
    padding: 14px;
  }
  
  /* 配置執行區：垂直堆疊 */
  .config-action-section {
    flex-direction: column;
    gap: 12px;
  }
  
  /* 選擇器區：改為垂直堆疊 */
  .selector-section {
    padding: 14px;
  }
  
  .selector-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .selector-item {
    width: 100%;
  }
  
  .compact-label {
    font-size: 13px;
  }
  
  /* 按鈕區：全寬大按鈕 */
  .action-section {
    width: 100%;
    min-width: 100%;
  }
  
  .analyze-btn {
    min-height: 54px;
    font-size: 15px;
    font-weight: 700;
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
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.03) 0%, rgba(100, 210, 255, 0.05) 100%);
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
  border: 1px solid rgba(64, 158, 255, 0.15);
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
  border-color: rgba(64, 158, 255, 0.35);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.step-number {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #409eff 0%, #64d2ff 100%);
  color: white;
  font-size: 16px;
  font-weight: 700;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
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
  border-top: 1px solid rgba(64, 158, 255, 0.1);
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

/* 響應式佈局 */
@media (max-width: 768px) {
  .main-sections-row {
    grid-template-columns: 1fr;
  }
  
  .config-action-section {
    flex-direction: column;
  }
  
  .upload-row {
    grid-template-columns: 1fr;
  }
  
  .csr-view {
    padding: 8px;
  }
  
  .analyze-btn {
    min-height: 48px;
  }
}
</style>
