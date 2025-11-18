<!-- moved copy for src structure -->
<template>
  <div class="chat-input-container" :class="theme">
    <div class="input-wrapper">
      <input type="file" ref="fileInput" class="file-input" multiple accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" @change="handleFileChange" />
      <el-button type="primary" @click="triggerFileInput" circle class="upload-btn-inside" :title="'上傳圖片或文件'">
        <Paperclip />
      </el-button>
      <el-input type="textarea" v-model="text" :rows="3" placeholder="請輸入訊息，按 Enter 送出" @keydown.enter.prevent="handleSend" clearable :maxlength="1000" show-word-limit class="input-textarea" />
      <ModelSelector v-model="selectedModel" :options="modelOptions" @change="handleModelChange" />
      <el-button type="primary" @click="handleSend" :disabled="!canSend" circle class="send-btn-inside" :title="'發送訊息'">
        <Promotion />
      </el-button>
    </div>

    <div v-if="files.length" class="file-preview-list">
      <div v-for="file in files" :key="file.id" class="file-preview-item" :title="file.name">
        <img v-if="isImage(file)" :src="file.url" alt="preview" class="file-preview-thumb" />
        <div v-else class="file-preview-name">📄 {{ file.name }}</div>
        <el-button size="mini" type="danger" circle @click="removeFile(file.id)" class="remove-file-btn" :title="'移除檔案'">
          <Delete />
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, inject } from 'vue'
import { Paperclip, Delete, Promotion, ChatDotRound, Lightning, Cpu, ArrowDown, Check } from '@element-plus/icons-vue'
import ModelSelector from '@/components/ModelSelector.vue'
import { MODEL_OPTIONS } from '@/constants/models'
import { useFileUploads } from '@/hooks/useFileUploads'
import { useModelSelection } from '@/hooks/useModelSelection'

export default {
  name: 'ChatInput',
  components: { Paperclip, Delete, Promotion, ChatDotRound, Lightning, Cpu, ArrowDown, Check, ModelSelector },
  emits: ['send', 'model-change'],
  setup(_: unknown, { emit }) {
    const theme = inject('theme', 'light') as 'light' | 'dark'
    const text = ref('')
    // 檔案處理抽象
    const { files, onFileChange, removeFile, isImage } = useFileUploads({ maxSizeMB: 10 })
    // 模型選擇抽象（維持外部 emit）
    const { selectedModel, setModel } = useModelSelection('GPT-5 mini', (m) => emit('model-change', m))
    // 直接引用集中管理的模型常數（保持行為不變）
    const modelOptions = MODEL_OPTIONS
  const fileInput = ref<HTMLInputElement | null>(null)
    const triggerFileInput = () => { if (fileInput.value) fileInput.value.click() }
    const handleFileChange = onFileChange
    const canSend = computed(() => (text.value && text.value.trim().length > 0) || files.length > 0)
    const handleSend = () => {
      if (!canSend.value) return
      const sendFiles = files.map(({ id, name, size, type, url }) => ({ id, name, size, type, url }))
      emit('send', { text: text.value.trim(), files: sendFiles })
      text.value = ''
      files.splice(0, files.length)
    }
  const handleModelChange = (model: string) => { setModel(model) }
  // 初始模型通知（保險同步一次）
  emit('model-change', selectedModel.value)
    return { theme, text, files, fileInput, selectedModel, modelOptions, triggerFileInput, handleFileChange, removeFile, handleSend, handleModelChange, canSend, isImage }
  }
}
</script>

<style scoped>
/* 複製自原檔（略） — 維持視覺不變 */
.chat-input-container { padding: 0; background-color: transparent; display: flex; flex-direction: column; gap: 10px; transition: background-color .35s ease; }
.input-wrapper { position: relative; width: 100%; }
.file-input { display: none; }
.upload-btn-inside { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); z-index: 1; --el-button-bg-color: var(--button-bg); --el-button-hover-bg-color: var(--el-color-primary-dark-2); --el-button-active-bg-color: var(--el-color-primary); transition: background-color 0.25s ease, filter 0.25s ease; }
.upload-btn-inside:hover:not(:disabled) { filter: brightness(1.12); }
.upload-btn-inside:active:not(:disabled) { filter: brightness(0.92); }
.input-textarea :deep(.el-textarea__inner) { border-radius: 20px; background-color: var(--card-bg); color: var(--text-color); box-shadow: 0 0 0 1px var(--border-color); padding-left: 60px; padding-right: 180px; transition: box-shadow .25s ease, background-color .35s ease, color .35s ease; }
.dark .input-textarea :deep(.el-textarea__inner) { background-color: var(--ai-msg-bg); box-shadow: none; }
.input-textarea :deep(.el-textarea__inner::placeholder) { color: rgba(0,0,0,0.35); }
.dark .input-textarea :deep(.el-textarea__inner::placeholder) { color: rgba(255,255,255,0.35); }
.input-textarea :deep(.el-textarea__inner:focus) { box-shadow: 0 0 0 1px var(--el-color-primary), 0 0 0 3px rgba(124,58,237,0.35); }
.input-textarea :deep(.el-input__count) { color: rgba(0, 0, 0, 0.5); font-size: 12px; background: transparent; transition: color .35s ease; }
.dark .input-textarea :deep(.el-input__count) { color: rgba(255, 255, 255, 0.55); }
.send-btn-inside { position: absolute; right: 20px; top: 50%; transform: translateY(-50%) translateY(-8px); min-width: 32px; width: 32px; height: 32px; font-size: 1rem; z-index: 1; --el-button-bg-color: var(--button-bg); --el-button-hover-bg-color: var(--el-color-primary-dark-2); --el-button-active-bg-color: var(--el-color-primary); transition: background-color .25s ease, filter .25s ease; padding: 0; }
.send-btn-inside:disabled { opacity: 0.55; cursor: not-allowed; filter: grayscale(0.25); }
.send-btn-inside:not(:disabled):hover { filter: brightness(1.12); }
.send-btn-inside:not(:disabled):active { filter: brightness(0.92); }
.file-preview-list { display: flex; gap: 12px; flex-wrap: wrap; max-height: 100px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb) transparent; padding: 0 20px 0 24px; }
.file-preview-list::-webkit-scrollbar { height: 8px; }
.file-preview-list::-webkit-scrollbar-track { background: transparent; }
.file-preview-list::-webkit-scrollbar-thumb { background-color: var(--scrollbar-thumb); border-radius: 4px; }
.file-preview-item { position: relative; background-color: var(--ai-msg-bg); border-radius: 6px; padding: 4px; display: flex; align-items: center; gap: 6px; max-width: 120px; box-shadow: 0 1px 3px rgba(0 0 0 / 0.18); border: 1px solid var(--border-color); transition: box-shadow .25s ease, transform .25s ease, background-color .35s ease, border-color .35s ease; }
.file-preview-item:hover { box-shadow: 0 2px 6px rgba(0 0 0 / 0.35); transform: translateY(-2px); }
.file-preview-thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; user-select: none; }
.file-preview-name { font-size: 0.85rem; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80px; }
.remove-file-btn { position: absolute; top: -6px; right: -6px; padding: 0; width: 20px; height: 20px; font-size: 12px; line-height: 20px; background-color: #ef4444; border-radius: 50%; color: #fff; cursor: pointer; box-shadow: 0 0 4px rgba(0 0 0 / 0.35); transition: background-color 0.2s ease, filter .25s ease; }
.remove-file-btn:hover { background-color: #dc2626; }
.remove-file-btn:active { filter: brightness(0.88); }
 .input-wrapper :deep(.model-selector) { position: absolute; right: 100px; top: 80%; transform: translateY(-50%) translateY(-8px); z-index: 2; cursor: pointer; }
</style>
