<template>
  <div class="csr-view">
    <div class="form-card">
      <h2 class="title">CSR 智能履歷評估</h2>
      <div class="form-grid">
        <div class="form-item">
          <label class="label">上傳 JD（格式：docx/txt）</label>
          <div class="file-row">
            <input ref="jdInput" type="file" accept=".docx,.txt" class="hidden-input" @change="onFileChange($event, 'jd')" />
            <el-button class="file-btn" type="primary" @click="() => triggerFile('jd')">選擇檔案</el-button>
            <span class="file-name">{{ jdFile?.name || '未選擇任何檔案' }}</span>
          </div>
        </div>
        <div class="form-item">
          <label class="label">上傳 Resume（格式：docx/txt）</label>
          <div class="file-row">
            <input ref="resumeInput" type="file" accept=".docx,.txt" class="hidden-input" @change="onFileChange($event, 'resume')" />
            <el-button class="file-btn" type="primary" @click="() => triggerFile('resume')">選擇檔案</el-button>
            <span class="file-name">{{ resumeFile?.name || '未選擇任何檔案' }}</span>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="row-item">
          <label class="label">AI 模型：</label>
          <ModelSelector v-model="model" :options="modelOptions" />
        </div>
        <div class="row-item">
          <label class="label">WeSeeU 版本：</label>
          <el-select v-model="version" class="version-select" placeholder="請選擇版本">
            <el-option v-for="v in versions" :key="v" :label="v" :value="v" />
          </el-select>
        </div>
      </div>
      <div class="actions">
        <el-button type="primary" :loading="isAnalyzing" :disabled="!canAnalyze" @click="startAnalyze">開始分析</el-button>
        <el-button @click="$router.push('/chat')">回首頁</el-button>
      </div>
    </div>
    <div class="chat-card">
      <div ref="messagesContainer" class="messages-container">
        <transition-group name="message-fade" tag="div">
          <ChatMessage v-for="m in messages" :key="m.id" :message="m" />
        </transition-group>
        <div v-if="isAnalyzing" class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import ModelSelector from '@/components/ModelSelector.vue'
import ChatMessage from '@/components/ChatMessage.vue'
import { MODEL_OPTIONS } from '@/constants/models'
import { useScrollToBottom } from '@/hooks/useScrollToBottom'
import { useNotifier } from '@/hooks/useNotifier'
import { useCsrStreaming } from '@/hooks/useCsrStreaming'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

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
const { startAnalyze: startCsrAnalyze } = useCsrStreaming({ messages, analyzing: isAnalyzing, scroll })
const canAnalyze = computed(() => !!jdFile.value && !!resumeFile.value)
function triggerFile(type: 'jd' | 'resume') { (type === 'jd' ? jdInput.value : resumeInput.value)?.click() }
function onFileChange(e: Event, type: 'jd' | 'resume') {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!/\.(docx|txt)$/i.test(file.name)) {
    notifyError('僅支援 .docx 或 .txt 格式')
    input.value = ''
    return
  }
  if (type === 'jd') jdFile.value = file; else resumeFile.value = file
}
function startAnalyze() { if (!canAnalyze.value) return; startCsrAnalyze({ model: model.value, version: version.value, jdFile: jdFile.value, resumeFile: resumeFile.value }) }
</script>
<style scoped>
.csr-view { display:flex; flex-direction:column; gap:16px; height:100%; padding:16px; }
.form-card,.chat-card { background:var(--card-bg); color:var(--text-color); border:1px solid var(--border-color); border-radius:10px; padding:16px; }
.title{ font-size:18px; font-weight:600; margin-bottom:16px; }
.form-grid{ display:grid; grid-template-columns:1fr; gap:16px; }
.form-item .label{ display:block; font-weight:600; margin-bottom:8px; color:var(--text-color); }
.file-row{ display:flex; align-items:center; gap:12px; }
.hidden-input{ display:none; }
.file-btn{
  /* 讓上傳按鈕在深色/淺色都維持足夠對比 */
  --el-button-bg-color: var(--button-bg);
  --el-button-hover-bg-color: var(--el-color-primary-dark-2);
  --el-button-active-bg-color: var(--el-color-primary);
  --el-button-text-color: #fff;
  --el-button-hover-text-color: #fff;
  --el-button-active-text-color: #fff;
}
.file-name{ opacity:.8; }
.row{ display:flex; flex-wrap:wrap; gap:16px; margin-top:8px; }
.row-item{ display:flex; align-items:center; gap:10px; }
.version-select{ min-width:140px; }
.actions{ display:flex; gap:12px; margin-top:16px; }
.chat-card{ flex:1; min-height:240px; }
.messages-container{ max-height:50vh; overflow-y:auto; overflow-x:hidden; padding:8px; display:flex; flex-direction:column; }
.message-fade-enter-active,.message-fade-leave-active{ transition:opacity .3s; }
.message-fade-enter-from,.message-fade-leave-to{ opacity:0; }
.typing{ display:flex; gap:6px; padding:8px 12px; opacity:.8; }
.dot{ width:6px; height:6px; border-radius:50%; background:var(--text-color); animation:blink 1.2s infinite ease-in-out; }
.dot:nth-child(2){ animation-delay:.15s; }
.dot:nth-child(3){ animation-delay:.3s; }
@keyframes blink{ 0%,80%,100%{ opacity:.2;} 40%{ opacity:.9;} }
</style>
