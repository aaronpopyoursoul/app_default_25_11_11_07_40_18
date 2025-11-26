<template>
  <div class="csr-view">
    <div class="chat-card">
      <h2 class="title">CSR 智能履歷評估</h2>
      <div ref="messagesContainer" class="messages-container">
        <transition-group name="message-fade" tag="div">
          <ChatMessage v-for="m in messages" :key="m.id" :message="m" />
        </transition-group>
        <div v-if="isAnalyzing" class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
      </div>
    </div>
    <div class="form-card">
      <div class="compact-form">
        <!-- 主要區域：上傳區、選擇器、按鈕全部並排 -->
        <div class="main-sections-row">
          <!-- 檔案上傳區：垂直排列 -->
          <div class="upload-section">
            <div class="upload-row">
              <div class="upload-col">
                <div class="label-input-row">
                  <label class="compact-label">
                    上傳 JD（格式：docx/txt）
                  </label>
                  <div class="file-input-group">
                    <input ref="jdInput" type="file" accept=".doc,.docx,.txt" class="hidden-input" @change="onFileChange($event, 'jd')" />
                    <el-button size="small" class="file-btn" type="primary" @click="() => triggerFile('jd')">
                      <el-icon style="margin-right: 4px;"><Upload /></el-icon>
                      選擇檔案
                    </el-button>
                    <span class="file-name" :class="{ 'has-file': jdFile }">
                      {{ jdFile?.name || '未選擇任何檔案' }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="upload-col">
                <div class="label-input-row">
                  <label class="compact-label">
                    上傳 Resume（格式：docx/txt）
                  </label>
                  <div class="file-input-group">
                    <input ref="resumeInput" type="file" accept=".doc,.docx,.txt" class="hidden-input" @change="onFileChange($event, 'resume')" />
                    <el-button size="small" class="file-btn" type="primary" @click="() => triggerFile('resume')">
                      <el-icon style="margin-right: 4px;"><Upload /></el-icon>
                      選擇檔案
                    </el-button>
                    <span class="file-name" :class="{ 'has-file': resumeFile }">
                      {{ resumeFile?.name || '未選擇任何檔案' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 選擇器區：垂直排列 -->
          <div class="selector-section">
            <div class="selector-row">
              <div class="selector-col">
                <div class="label-input-row">
                  <label class="compact-label">
                    AI 模型
                  </label>
                  <ModelSelector v-model="model" :options="modelOptions" />
                </div>
              </div>
              <div class="selector-col">
                <div class="label-input-row">
                  <label class="compact-label">
                    WeSeeU 版本
                  </label>
                  <el-select v-model="version" size="small" class="version-select" placeholder="請選擇版本">
                    <el-option v-for="v in versions" :key="v" :label="v" :value="v" />
                  </el-select>
                </div>
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
import { ref, computed, onMounted } from 'vue'
import { Upload, DataAnalysis } from '@element-plus/icons-vue'
import ModelSelector from '@/components/ModelSelector.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import { MODEL_OPTIONS } from '@/constants/models'
import { useScrollToBottom } from '@/hooks/useScrollToBottom'
import { useNotifier } from '@/hooks/useNotifier'
import { analyzeCsr } from '@/hooks/useCsrApi'
import type { CsrApiResponse } from '@/types/csr'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

// 使用說明彈窗相關
const GUIDE_STORAGE_KEY = 'csrresumeview-guide-shown'
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
const { scroll } = useScrollToBottom(messagesContainer)
const { notifyError } = useNotifier()
const canAnalyze = computed(() => !!jdFile.value && !!resumeFile.value)
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
async function startAnalyze() {
  if (!canAnalyze.value || !jdFile.value || !resumeFile.value) return
  isAnalyzing.value = true

  // 使用者起始訊息
  messages.value.push({
    id: Date.now() + '-user',
    type: 'user',
    content: {
      text: `開始分析\n模型：${model.value}｜版本：${version.value}\nJD：${jdFile.value.name}\nResume：${resumeFile.value.name}`,
      files: []
    },
    timestamp: new Date()
  })

  // AI 佔位訊息（稍後替換為 Answer）
  const placeholderMsg: ChatMessageType = {
    id: Date.now() + '-ai-answer',
    type: 'ai',
    content: { text: '分析中請稍候…', files: [], meta: {} },
    timestamp: new Date()
  }
  messages.value.push(placeholderMsg)
  scroll()

  try {
    const data: CsrApiResponse = await analyzeCsr({
      jdFile: jdFile.value,
      resumeFile: resumeFile.value,
      aiModel: model.value,
      appVersion: version.value
    })
    // 1) Answer：僅顯示主要分析文字（支援 HTML）
    const answerText = (data.answer && data.answer.trim().length) ? data.answer : '（無分析內容）'
    placeholderMsg.content.text = answerText
    placeholderMsg.content.meta = { isHtml: true, messageKind: 'answer' }

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

    // 3) Usage & Info：原樣顯示（美化排版）
    const usageLines = data.usage ? `Input tokens: ${data.usage.input_tokens ?? '-'}\nOutput tokens: ${data.usage.output_tokens ?? '-'}\nTotal cost: $${data.usage.total_cost ?? '-'}` : '（無使用量資訊）'
    const infoLines = data.info ? `模型：${data.info.aiModel ?? model.value}\n版本：${data.info.appVersion ?? version.value}\nJD：${data.info.jd_file ?? jdFile.value.name}\nResume：${data.info.resume_file ?? resumeFile.value.name}` : '（無附加資訊）'
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
    // 更新佔位為失敗簡述 + 推獨立錯誤訊息
    placeholderMsg.content.text = '分析失敗'
    messages.value.push({
      id: Date.now() + '-ai-error',
      type: 'ai',
      content: { text: `錯誤：${e?.message || e}`, files: [], meta: { messageKind: 'error' } },
      timestamp: new Date()
    })
  } finally {
    isAnalyzing.value = false
    scroll()
  }
}
</script>
<style scoped>
.csr-view { 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
  height: 100%; 
  padding: 12px; 
}

.form-card, .chat-card { 
  background: var(--card-bg); 
  color: var(--text-color); 
  border: 1px solid var(--border-color); 
  border-radius: 8px; 
  padding: 12px; 
}

.title { 
  font-size: 17px; 
  font-weight: 600; 
  margin-bottom: 12px; 
  color: var(--text-color);
}

/* 緊湊表單容器 */
.compact-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* 主要區域並排容器 */
.main-sections-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 14px;
  align-items: stretch;
}

/* 檔案上傳區段:帶背景區分 */
.upload-section {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.04) 0%, rgba(100, 210, 255, 0.04) 100%);
  border: 1px solid rgba(64, 158, 255, 0.15);
  border-radius: 6px;
  padding: 12px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.upload-section:hover {
  border-color: rgba(64, 158, 255, 0.25);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.08);
}

:global(.dark) .upload-section {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(100, 210, 255, 0.08) 100%);
  border-color: rgba(64, 158, 255, 0.2);
}

/* 檔案上傳區:橫向並排 */
.upload-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 12px;
  flex: 1;
}

.upload-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Label 和輸入控件橫向排列 */
.label-input-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 選擇器區段：帶背景區分 */
.selector-section {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.04) 0%, rgba(103, 194, 58, 0.04) 100%);
  border: 1px solid rgba(103, 194, 58, 0.15);
  border-radius: 6px;
  padding: 12px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.selector-section:hover {
  border-color: rgba(103, 194, 58, 0.25);
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.08);
}

:global(.dark) .selector-section {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.08) 0%, rgba(103, 194, 58, 0.08) 100%);
  border-color: rgba(103, 194, 58, 0.2);
}

.selector-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex: 1;
}

.selector-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.compact-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.3px;
  white-space: nowrap;
  min-width: fit-content;
}

.label-icon {
  font-size: 16px;
  line-height: 1;
}

.file-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.hidden-input { 
  display: none; 
}

.file-btn {
  --el-button-bg-color: var(--button-bg);
  --el-button-hover-bg-color: var(--el-color-primary-dark-2);
  --el-button-active-bg-color: var(--el-color-primary);
  --el-button-text-color: #fff;
  --el-button-hover-text-color: #fff;
  --el-button-active-text-color: #fff;
  flex-shrink: 0;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.15);
}

.file-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.25);
}

.file-btn:active {
  transform: translateY(0);
}

.file-name { 
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.6; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  transition: all 0.3s ease;
}

.file-name.has-file {
  opacity: 0.95;
  color: var(--el-color-success);
  font-weight: 500;
}

.version-select { 
  flex: 1;
  min-width: 0;
}

/* 按鈕區 */
.action-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.analyze-btn {
  min-width: 140px;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  padding: 0 20px;
  box-shadow: 0 3px 6px rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.analyze-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(64, 158, 255, 0.3);
}

.analyze-btn:active {
  transform: translateY(0);
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
  
  .upload-row,
  .selector-row {
    grid-template-columns: 1fr;
  }
  
  .csr-view {
    padding: 8px;
  }
  
  .action-section {
    align-items: stretch;
  }
  
  .analyze-btn {
    width: 100%;
    min-height: 48px;
  }
}

/* 深色模式特殊處理 */
:global(.dark) .file-btn {
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

:global(.dark) .file-btn:hover {
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.4);
}

:global(.dark) .analyze-btn {
  box-shadow: 0 3px 6px rgba(64, 158, 255, 0.35);
}

:global(.dark) .analyze-btn:not(:disabled):hover {
  box-shadow: 0 6px 12px rgba(64, 158, 255, 0.45);
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

/* 深色模式優化 */
:global(.dark) .guide-content {
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(100, 210, 255, 0.1) 100%);
}

:global(.dark) .step-card {
  border-color: rgba(64, 158, 255, 0.25);
}

:global(.dark) .step-card:hover {
  border-color: rgba(64, 158, 255, 0.45);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
}
</style>
