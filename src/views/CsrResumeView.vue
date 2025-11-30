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
          <span class="title-text">CSR 智能履歷分析</span>
        </div>
        <el-icon class="help-icon" @click="showGuideDialog = true"><QuestionFilled /></el-icon>
      </h2>
      <div ref="messagesContainer" class="messages-container">
        <transition-group name="message-fade" tag="div">
          <ChatMessage v-for="m in messages" :key="m.id" :message="m" />
        </transition-group>
        <div v-if="isAnalyzing" class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
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
                      <span class="file-name-display">{{ jdFile.name }}</span>
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
                      <span class="file-name-display">{{ resumeFile.name }}</span>
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
                    <el-option v-for="v in versions" :key="v" :label="v" :value="v" />
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
import { MODEL_OPTIONS } from '@/constants/models'
import { useScrollToBottom } from '@/hooks/useScrollToBottom'
import { useNotifier } from '@/hooks/useNotifier'
import { analyzeCsr } from '@/hooks/useCsrApi'
import type { CsrApiResponse } from '@/types/csr'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

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
const versions = ['1.0', '1.1', '2.0']
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
    
    messages.value.push({
      id: Date.now() + '-ai-answer',
      type: 'ai',
      content: { 
        text: answerText, 
        files: [], 
        meta: { isHtml: true, messageKind: 'answer' } 
      },
      timestamp: new Date()
    })
    
    // 情境 3：多段訊息 → 只滾動到第一段（answer）的開頭
    forceScrollToLatestMessage()

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
}

/* 主要區域並排容器：上傳區 50% + 配置執行區 50% */
.main-sections-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: stretch;
}

/* 配置執行區：包含選擇器和按鈕 */
.config-action-section {
  display: flex;
  gap: 12px;
  align-items: stretch;
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
  height: 44px;
  border: 1.5px dashed rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
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
  gap: 8px;
  flex-wrap: nowrap;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.file-icon {
  font-size: 16px;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.file-details {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.file-name-display {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 10px;
  color: var(--text-color);
  opacity: 0.6;
  white-space: nowrap;
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
}

.selector-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
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
}

.version-select { 
  width: 100%;
}

/* 按鈕區：緊湊化 */
.action-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 140px;
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

.analyze-btn:disabled {
  background: linear-gradient(to bottom, rgba(174, 174, 178, 0.3), rgba(174, 174, 178, 0.25));
  box-shadow: none;
  opacity: 0.5;
  cursor: not-allowed;
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

/* 響應式：小螢幕自動堆疊 */
@media (max-width: 768px) {
  .main-sections-row {
    grid-template-columns: 1fr;
  }
  
  .config-action-section {
    flex-direction: column;
    gap: 16px;
  }
  
  .upload-row {
    flex-direction: column;
    gap: 14px;
  }
  
  /* 檔案上傳區：增加高度以符合觸控標準 */
  .file-upload-area {
    min-height: 48px;
    height: auto;
    padding: 12px;
  }
  
  /* 上傳提示文字調整 */
  .upload-hint {
    font-size: 13px;
  }
  
  .upload-icon {
    font-size: 20px;
  }
  
  /* 選擇器區：手機版保持橫向並排 */
  .selector-section {
    padding: 16px;
  }
  
  .selector-row {
    gap: 10px;
  }
  
  .selector-item {
    flex: 1;
  }
  
  /* 按鈕區：全寬顯示 */
  .action-section {
    min-width: 100%;
  }
  
  .analyze-btn {
    min-height: 52px;
    font-size: 15px;
  }
  
  .csr-view {
    padding: 8px;
    gap: 10px;
  }
  
  /* 卡片內邊距調整 */
  .form-card, .chat-card {
    padding: 10px;
  }
  
  /* 上傳區和選擇器區增加內邊距 */
  .upload-section {
    padding: 16px;
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
