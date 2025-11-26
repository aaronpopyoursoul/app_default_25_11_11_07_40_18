<!-- moved copy for src structure -->
<template>
  <div class="chat-input-container" :class="theme">
    <div class="input-wrapper">
      <input type="file" ref="fileInput" class="file-input" multiple accept=".csv,text/csv" @change="handleFileChange" />
      <!-- <el-button type="primary" @click="triggerFileInput" circle class="upload-btn-inside" :title="'上傳 CSV 檔案'">
        <Paperclip />
      </el-button> -->
      <el-input type="textarea" v-model="text" :rows="3" placeholder="請輸入訊息,按 Enter 送出" @keydown.enter.prevent="handleSend" clearable :maxlength="1000" show-word-limit class="input-textarea" />
      <el-button type="primary" @click="openDataDialog" class="data-gen-btn" size="small">
        <el-icon style="margin-right: 4px;"><DataAnalysis /></el-icon>
        數據生成
      </el-button>
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

    <!-- 數據生成 Dialog -->
    <el-dialog v-model="dataDialogVisible" title="數據生成" width="1000px" :close-on-click-modal="false">
      <div class="dialog-form-container">
        <el-form :model="dataForm" label-width="140px" label-position="left" class="data-gen-form">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="貸款金額">
                <el-input v-model="dataForm.loan_amnt" placeholder="請輸入貸款金額" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="期限/期數">
                <el-input v-model="dataForm.term" placeholder="請輸入期限" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="利率">
                <el-input v-model="dataForm.int_rate" placeholder="請輸入利率" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="分期付款金額">
                <el-input v-model="dataForm.installment" placeholder="請輸入分期付款金額" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="貸款等級">
                <el-input v-model="dataForm.grade" placeholder="請輸入貸款等級" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="貸款子等級">
                <el-input v-model="dataForm.sub_grade" placeholder="請輸入貸款子等級" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="職位名稱">
                <el-input v-model="dataForm.emp_title" placeholder="請輸入職位名稱" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="職位長度">
                <el-input v-model="dataForm.emp_length" placeholder="請輸入職位長度" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="房屋所有權">
                <el-input v-model="dataForm.home_ownership" placeholder="請輸入房屋所有權" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="年收入">
                <el-input v-model="dataForm.annual_inc" placeholder="請輸入年收入" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="驗證狀態">
                <el-input v-model="dataForm.verification_status" placeholder="請輸入驗證狀態" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="核發日期">
                <el-input v-model="dataForm.issue_d" placeholder="請輸入核發日期" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="貸款狀態">
                <el-input v-model="dataForm.loan_status" placeholder="請輸入貸款狀態" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="目的">
                <el-input v-model="dataForm.purpose" placeholder="請輸入目的" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="債務收入比">
                <el-input v-model="dataForm.dti" placeholder="請輸入債務收入比" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最早信用紀錄日期">
                <el-input v-model="dataForm.earliest_cr_line" placeholder="請輸入最早信用紀錄日期" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="開立帳戶數">
                <el-input v-model="dataForm.open_acc" placeholder="請輸入開立帳戶數" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="公共紀錄">
                <el-input v-model="dataForm.pub_rec" placeholder="請輸入公共紀錄" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="循環餘額">
                <el-input v-model="dataForm.revol_bal" placeholder="請輸入循環餘額" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="循環使用率">
                <el-input v-model="dataForm.revol_util" placeholder="請輸入循環使用率" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="地址">
                <el-input v-model="dataForm.address" placeholder="請輸入地址" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dataDialogVisible = false">關閉</el-button>
          <el-button type="primary" @click="handleDataGenerate">
            <el-icon style="margin-right: 4px;"><DataAnalysis /></el-icon>
            數據生成
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { ref, computed, inject, reactive } from 'vue'
import { Paperclip, Delete, Promotion, ChatDotRound, Lightning, Cpu, ArrowDown, Check, DataAnalysis } from '@element-plus/icons-vue'
import ModelSelector from '@/components/ModelSelector.vue'
import { MODEL_OPTIONS } from '@/constants/models'
import { useFileUploads } from '@/hooks/useFileUploads'
import { useModelSelection } from '@/hooks/useModelSelection'
import { ElMessage } from 'element-plus'
import type { LoanInput } from '@/types/api'

export default {
  name: 'ChatInput',
  components: { Paperclip, Delete, Promotion, ChatDotRound, Lightning, Cpu, ArrowDown, Check, DataAnalysis, ModelSelector },
  emits: ['send', 'model-change', 'form-data-update'],
  setup(_: unknown, { emit }) {
    const theme = inject('theme', 'light') as 'light' | 'dark'
    const text = ref('')
    
    // 數據生成 Dialog
    const dataDialogVisible = ref(false)
    const dataForm = reactive({
      loan_amnt: '',
      term: '',
      int_rate: '',
      installment: '',
      grade: '',
      sub_grade: '',
      emp_title: '',
      emp_length: '',
      home_ownership: '',
      annual_inc: '',
      verification_status: '',
      issue_d: '',
      loan_status: '',
      purpose: '',
      dti: '',
      earliest_cr_line: '',
      open_acc: '',
      pub_rec: '',
      revol_bal: '',
      revol_util: '',
      address: '',
      total_acc: '',
      mort_acc: '',
      pub_rec_bankruptcies: '',
      application_type: ''
    })
    
    // 範例數據
    const sampleData = [
      {
        name: 'Allen',
        loan_amnt: '30000',
        term: '60 months',
        int_rate: '18.5',
        installment: '768.12',
        sub_grade: 'D5',
        annual_inc: '45000',
        home_ownership: 'RENT',
        verification_status: 'Not Verified',
        purpose: 'debt_consolidation',
        dti: '28.5',
        open_acc: '5',
        pub_rec: '2',
        revol_bal: '10000',
        revol_util: '85',
        total_acc: '10',
        initial_list_status: 'f',
        application_type: 'Individual',
        mort_acc: '0',
        pub_rec_bankruptcies: '1',
        earliest_cr_line: 'Oct-1999'
      },
      {
        name: 'Billy',
        loan_amnt: '15000',
        term: '36 months',
        int_rate: '12',
        installment: '499',
        sub_grade: 'B3',
        annual_inc: '75000',
        home_ownership: 'MORTGAGE',
        verification_status: 'Source Verified',
        purpose: 'credit_card',
        dti: '15',
        open_acc: '12',
        pub_rec: '0',
        revol_bal: '15000',
        revol_util: '45',
        total_acc: '30',
        initial_list_status: 'w',
        application_type: 'Individual',
        mort_acc: '2',
        pub_rec_bankruptcies: '0',
        earliest_cr_line: 'Jan-2005'
      },
      {
        name: 'Cherry',
        loan_amnt: '5000',
        term: '36 months',
        int_rate: '6.5',
        installment: '153.21',
        sub_grade: 'A2',
        annual_inc: '120000',
        home_ownership: 'MORTGAGE',
        verification_status: 'Verified',
        purpose: 'major_purchase',
        dti: '5',
        open_acc: '18',
        pub_rec: '0',
        revol_bal: '5000',
        revol_util: '15',
        total_acc: '45',
        initial_list_status: 'w',
        application_type: 'Individual',
        mort_acc: '3',
        pub_rec_bankruptcies: '0',
        earliest_cr_line: 'Mar-1990'
      },
      {
        name: 'Donson',
        loan_amnt: '5000',
        term: '36 months',
        int_rate: '6.5',
        installment: '153.21',
        sub_grade: 'A2',
        annual_inc: '120000',
        home_ownership: 'MORTGAGE',
        verification_status: 'Verified',
        purpose: 'major_purchase',
        dti: '5',
        open_acc: '18',
        pub_rec: '0',
        revol_bal: '5000',
        revol_util: '15',
        total_acc: '45',
        initial_list_status: 'w',
        application_type: 'Individual',
        mort_acc: '3',
        pub_rec_bankruptcies: '0',
        earliest_cr_line: 'Mar-1990'
      },
      {
        name: 'Eason',
        loan_amnt: '85000',
        term: '36 months',
        int_rate: '6.5',
        installment: '153.21',
        sub_grade: 'G5',
        annual_inc: '120000',
        home_ownership: 'MORTGAGE',
        verification_status: 'Not Verified',
        purpose: 'major_purchase',
        dti: '40',
        open_acc: '18',
        pub_rec: '0',
        revol_bal: '115000',
        revol_util: '15',
        total_acc: '45',
        initial_list_status: 'w',
        application_type: 'Individual',
        mort_acc: '3',
        pub_rec_bankruptcies: '0',
        earliest_cr_line: 'Mar-1990'
      }
    ]
    
    const openDataDialog = () => {
      dataDialogVisible.value = true
    }
    
    const handleDataGenerate = () => {
      console.log('=== handleDataGenerate 被調用 ===')
      
      // 隨機選擇一筆範例數據
      const randomSample = sampleData[Math.floor(Math.random() * sampleData.length)]
      console.log('隨機選擇的樣本:', randomSample.name)
      
      // 填充表單數據
      dataForm.loan_amnt = randomSample.loan_amnt
      dataForm.term = randomSample.term
      dataForm.int_rate = randomSample.int_rate
      dataForm.installment = randomSample.installment
      dataForm.grade = randomSample.sub_grade.charAt(0)
      dataForm.sub_grade = randomSample.sub_grade
      dataForm.emp_title = ''
      dataForm.emp_length = '5 years'
      dataForm.home_ownership = randomSample.home_ownership
      dataForm.annual_inc = randomSample.annual_inc
      dataForm.verification_status = randomSample.verification_status
      dataForm.issue_d = ''
      dataForm.loan_status = ''
      dataForm.purpose = randomSample.purpose
      dataForm.dti = randomSample.dti
      dataForm.earliest_cr_line = randomSample.earliest_cr_line
      dataForm.open_acc = randomSample.open_acc
      dataForm.pub_rec = randomSample.pub_rec
      dataForm.revol_bal = randomSample.revol_bal
      dataForm.revol_util = randomSample.revol_util
      dataForm.total_acc = randomSample.total_acc
      dataForm.mort_acc = randomSample.mort_acc
      dataForm.pub_rec_bankruptcies = randomSample.pub_rec_bankruptcies
      dataForm.application_type = randomSample.application_type
      dataForm.address = ''
      
      // 準備 LoanInput 格式並通知父組件
      const loanInput: LoanInput = {
        loan_amnt: Number(randomSample.loan_amnt),
        int_rate: Number(randomSample.int_rate),
        installment: Number(randomSample.installment),
        sub_grade: randomSample.sub_grade,
        annual_inc: Number(randomSample.annual_inc),
        dti: Number(randomSample.dti),
        open_acc: parseInt(randomSample.open_acc),
        pub_rec: parseInt(randomSample.pub_rec),
        revol_bal: Number(randomSample.revol_bal),
        revol_util: Number(randomSample.revol_util),
        total_acc: parseInt(randomSample.total_acc),
        mort_acc: parseInt(randomSample.mort_acc),
        pub_rec_bankruptcies: parseInt(randomSample.pub_rec_bankruptcies),
        earliest_cr_line: randomSample.earliest_cr_line,
        term: randomSample.term,
        grade: randomSample.sub_grade.charAt(0),
        emp_length: '5 years',
        home_ownership: randomSample.home_ownership,
        verification_status: randomSample.verification_status,
        purpose: randomSample.purpose,
        application_type: randomSample.application_type
      }
      
      // 發送 form-data-update 事件給父組件
      console.log('=== 即將 emit form-data-update ===')
      emit('form-data-update', loanInput)
      console.log('=== emit form-data-update 完成 ===')
      
      console.log('準備發送的 LoanInput:', loanInput)
      
      ElMessage.success('數據已生成!')
    }
    
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
    return { 
      theme, text, files, fileInput, selectedModel, modelOptions, 
      triggerFileInput, handleFileChange, removeFile, handleSend, handleModelChange, canSend, isImage,
      dataDialogVisible, dataForm, openDataDialog, handleDataGenerate
    }
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
.input-textarea :deep(.el-textarea__inner) { border-radius: 20px; background-color: var(--card-bg); color: var(--text-color); box-shadow: 0 0 0 1px var(--border-color); padding-left: 20px; padding-right: 240px; transition: box-shadow .25s ease, background-color .35s ease, color .35s ease; }
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
 .input-wrapper :deep(.model-selector) { position: absolute; right: 60px; top: 80%; transform: translateY(-50%) translateY(-8px); z-index: 2; cursor: pointer; }

/* 數據生成按鈕 */
.data-gen-btn {
  position: absolute;
  right: 75px;
  top: 35%;
  transform: translateY(-50%) translateY(-8px);
  height: 28px;
  font-size: 13px;
  z-index: 2;
  --el-button-bg-color: var(--button-bg);
  --el-button-hover-bg-color: var(--el-color-primary-dark-2);
  --el-button-active-bg-color: var(--el-color-primary);
  transition: background-color .25s ease, filter .25s ease;
  padding: 0 12px;
  border-radius: 6px;
  white-space: nowrap;
}

.data-gen-btn:hover {
  filter: brightness(1.12);
}

.data-gen-btn:active {
  filter: brightness(0.92);
}

/* Dialog 樣式 */
:deep(.el-dialog) {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

:deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--card-bg);
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
}

:deep(.el-dialog__body) {
  padding: 24px;
  background-color: var(--card-bg);
  color: var(--text-color);
  max-height: 500px;
  overflow-y: auto;
}

.dialog-form-container {
  width: 100%;
}

.data-gen-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.data-gen-form :deep(.el-input__inner) {
  font-size: 14px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  background-color: var(--card-bg);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item__label) {
  color: var(--text-color);
  font-weight: 500;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner),
:deep(.el-select .el-input__inner) {
  background-color: var(--card-bg);
  color: var(--text-color);
  border-color: var(--border-color);
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-radio__label) {
  color: var(--text-color);
}
</style>
