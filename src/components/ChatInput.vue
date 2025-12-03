<!-- moved copy for src structure -->
<template>
  <div class="chat-input-container">
    <div class="input-wrapper">
      <input type="file" ref="fileInput" class="file-input" multiple accept=".csv,text/csv" @change="handleFileChange" />
      <!-- <el-button type="primary" @click="triggerFileInput" circle class="upload-btn-inside" :title="'上傳 CSV 檔案'">
        <Paperclip />
      </el-button> -->
      <el-input type="textarea" v-model="text" :rows="3" placeholder="請輸入訊息" @keydown.enter.prevent="handleSend" clearable :maxlength="1000" show-word-limit class="input-textarea" :disabled="disabled" />
      <el-button type="primary" @click="openDataDialog" class="data-gen-btn" size="small" :disabled="disabled">
        <el-icon style="margin-right: 4px;"><DataAnalysis /></el-icon>
        資料生成
      </el-button>
      <ModelSelector v-model="selectedModel" :options="modelOptions" @change="handleModelChange" />
      <el-button type="primary" @click="handleSend" :disabled="!canSend || disabled" circle class="send-btn-inside" :title="'發送訊息'">
        <Promotion />
      </el-button>
      

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
    <el-dialog
      v-model="dataDialogVisible"
      title="資料生成"
      :width="dialogWidth"
      :fullscreen="isMobile"
      :close-on-click-modal="false"
      :append-to-body="true"
      custom-class="data-gen-dialog"
      :z-index="3000"
    >
      <div class="dialog-form-container">
        <!-- 驗證錯誤提示 -->
        <transition name="el-fade-in">
          <div v-if="showValidationAlert" class="validation-alert">
            <div class="validation-alert-content">
              <el-icon class="validation-alert-icon"><WarningFilled /></el-icon>
              <span class="validation-alert-text">請填寫所有必填欄位</span>
            </div>
          </div>
        </transition>
        
        <el-form 
          :model="dataForm" 
          :label-width="isMobile ? 'auto' : '140px'" 
          :label-position="isMobile ? 'top' : 'left'" 
          class="data-gen-form"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="貸款金額" :class="{ 'validation-error': validationErrors.has('loan_amnt') }">
                <el-input v-model="dataForm.loan_amnt" placeholder="請輸入貸款金額">
                  <template #append>
                    <span class="currency-suffix">USD</span>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="期限/期數" :class="{ 'validation-error': validationErrors.has('term') }">
                <el-select v-model="dataForm.term" placeholder="選擇期數" filterable style="width: 100%" popper-class="data-gen-popper" :teleported="false">
                  <el-option v-for="opt in termOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="利率" :class="{ 'validation-error': validationErrors.has('int_rate') }">
                <el-input v-model="dataForm.int_rate" placeholder="請輸入利率" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="分期付款金額" :class="{ 'validation-error': validationErrors.has('installment') }">
                <el-input v-model="dataForm.installment" placeholder="請輸入分期付款金額">
                  <template #append>
                    <span class="currency-suffix">USD</span>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="貸款等級" :class="{ 'validation-error': validationErrors.has('grade') }">
                <el-select v-model="dataForm.grade" placeholder="選擇等級 (A~G)" filterable style="width: 100%" popper-class="data-gen-popper" :teleported="false">
                  <el-option v-for="opt in gradeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="貸款子等級" :class="{ 'validation-error': validationErrors.has('sub_grade') }">
                <el-select v-model="dataForm.sub_grade" placeholder="選擇子等級" filterable style="width: 100%" popper-class="data-gen-popper" :teleported="false">
                  <el-option v-for="opt in subGradeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="職位名稱" :class="{ 'validation-error': validationErrors.has('emp_title') }">
                <el-select v-model="dataForm.emp_title" placeholder="選擇職位" filterable style="width: 100%" popper-class="data-gen-popper" :teleported="false">
                  <el-option v-for="opt in empTitleOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="職位年資" :class="{ 'validation-error': validationErrors.has('emp_length') }">
                <el-input v-model="dataForm.emp_length" placeholder="僅輸入數字或 10+ / <1" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="房屋所有權" :class="{ 'validation-error': validationErrors.has('home_ownership') }">
                <el-select v-model="dataForm.home_ownership" placeholder="選擇房屋狀態" filterable style="width: 100%" popper-class="data-gen-popper" :teleported="false">
                  <el-option v-for="opt in homeOwnershipOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="年收入" :class="{ 'validation-error': validationErrors.has('annual_inc') }">
                <el-input v-model="dataForm.annual_inc" placeholder="請輸入年收入">
                  <template #append>
                    <span class="currency-suffix">USD</span>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="驗證狀態" :class="{ 'validation-error': validationErrors.has('verification_status') }">
                <el-select v-model="dataForm.verification_status" placeholder="選擇驗證狀態" filterable style="width: 100%" popper-class="data-gen-popper" :teleported="false">
                  <el-option v-for="opt in verificationStatusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="核發月份" :class="{ 'validation-error': validationErrors.has('issue_d') }">
                <el-input 
                  v-model="dataForm.issue_d" 
                  placeholder="格式: Jan-2024"
                  readonly
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="申請類型" :class="{ 'validation-error': validationErrors.has('application_type') }">
                <el-select v-model="dataForm.application_type" placeholder="選擇申請類型" filterable style="width: 100%" popper-class="data-gen-popper" :teleported="false">
                  <el-option v-for="opt in applicationTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="目的" :class="{ 'validation-error': validationErrors.has('purpose') }">
                <el-select v-model="dataForm.purpose" placeholder="選擇用途" filterable style="width: 100%" popper-class="data-gen-popper" :teleported="false">
                  <el-option v-for="opt in purposeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="債務收入比" :class="{ 'validation-error': validationErrors.has('dti') }">
                <el-input v-model="dataForm.dti" placeholder="請輸入債務收入比" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最早信用紀錄月份" :class="{ 'validation-error': validationErrors.has('earliest_cr_line') }">
                <el-input 
                  v-model="dataForm.earliest_cr_line" 
                  placeholder="格式: Jan-2020"
                  readonly
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="開立帳戶數" :class="{ 'validation-error': validationErrors.has('open_acc') }">
                <el-input v-model="dataForm.open_acc" placeholder="請輸入開立帳戶數" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="公共紀錄" :class="{ 'validation-error': validationErrors.has('pub_rec') }">
                <el-input v-model="dataForm.pub_rec" placeholder="請輸入公共紀錄" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="循環餘額" :class="{ 'validation-error': validationErrors.has('revol_bal') }">
                <el-input v-model="dataForm.revol_bal" placeholder="請輸入循環餘額">
                  <template #append>
                    <span class="currency-suffix">USD</span>
                  </template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="循環使用率" :class="{ 'validation-error': validationErrors.has('revol_util') }">
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
          <div class="left-actions">
            <el-button type="primary" @click="handleDataGenerate">
              <el-icon style="margin-right: 4px;"><DataAnalysis /></el-icon>
              資料生成
            </el-button>
          </div>
          <div class="right-actions">
              <el-button type="danger" @click="dataDialogVisible = false">關閉</el-button>
              <el-button type="success" @click="handleSubmitAndChat">送出</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, inject, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Paperclip, Delete, Promotion, ChatDotRound, Lightning, Cpu, ArrowDown, Check, DataAnalysis, WarningFilled } from '@element-plus/icons-vue'
import ModelSelector from '@/components/ModelSelector.vue'
import { MODEL_OPTIONS } from '@/constants/models'
import { useFileUploads } from '@/hooks/useFileUploads'
import { useModelSelection } from '@/hooks/useModelSelection'
import { ElMessage } from 'element-plus'
import type { LoanInput } from '@/types/api'
import {
  TERM_OPTIONS,
  GRADE_OPTIONS,
  SUB_GRADE_OPTIONS,
  HOME_OWNERSHIP_OPTIONS,
  VERIFICATION_STATUS_OPTIONS,
  PURPOSE_OPTIONS,
  buildSubGradeOptionsByGrade,
  APPLICATION_TYPE_OPTIONS
} from '@/constants/lendingEnums'

export default {
  name: 'ChatInput',
  components: { Paperclip, Delete, Promotion, ChatDotRound, Lightning, Cpu, ArrowDown, Check, DataAnalysis, ModelSelector },
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['send', 'model-change', 'form-data-update'],
  setup(props: { disabled: boolean }, { emit }) {
    const text = ref('')
    
    // 響應式視窗大小檢測
    const windowWidth = ref(window.innerWidth)
    const isMobile = computed(() => windowWidth.value <= 768)
    const dialogWidth = computed(() => isMobile.value ? '100%' : '1000px')
    
    const handleResize = () => {
      windowWidth.value = window.innerWidth
    }
    
    onMounted(() => {
      window.addEventListener('resize', handleResize)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })
    
    // 數據生成 Dialog
    const dataDialogVisible = ref(false)
    
    // 監聽 Dialog 開啟,手動設置固定底部樣式
    watch(dataDialogVisible, async (newVal) => {
      if (newVal && isMobile.value) {
        await nextTick()
        // 延遲確保 DOM 已渲染
        setTimeout(() => {
          const footer = document.querySelector('.data-gen-dialog .el-dialog__footer') as HTMLElement
          const body = document.querySelector('.data-gen-dialog .el-dialog__body') as HTMLElement
          const dialog = document.querySelector('.data-gen-dialog') as HTMLElement
          
          if (footer) {
            footer.style.position = 'fixed'
            footer.style.bottom = '0'
            footer.style.left = '0'
            footer.style.right = '0'
            footer.style.width = '100%'
            footer.style.zIndex = '9999'
            footer.style.padding = '12px 16px'
            footer.style.paddingBottom = 'calc(12px + env(safe-area-inset-bottom))'
            footer.style.margin = '0'
            footer.style.background = 'rgba(255, 255, 255, 0.95)'
            footer.style.backdropFilter = 'blur(20px)';
            (footer.style as any).webkitBackdropFilter = 'blur(20px)'
            footer.style.boxShadow = '0 -4px 16px rgba(0, 0, 0, 0.12)'
            footer.style.borderTop = '1px solid rgba(0, 0, 0, 0.08)'
          }
          
          if (body) {
            body.style.paddingBottom = '100px'
            body.style.overflowY = 'auto';
            (body.style as any).webkitOverflowScrolling = 'touch'
          }
          
          if (dialog) {
            dialog.style.display = 'flex'
            dialog.style.flexDirection = 'column'
            dialog.style.height = '100vh'
            dialog.style.overflow = 'hidden'
          }
        }, 100)
      }
    })
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

    // 下拉選單資料
    const termOptions = TERM_OPTIONS
    const gradeOptions = GRADE_OPTIONS
    const homeOwnershipOptions = HOME_OWNERSHIP_OPTIONS
    const verificationStatusOptions = VERIFICATION_STATUS_OPTIONS
    const purposeOptions = PURPOSE_OPTIONS
    const applicationTypeOptions = APPLICATION_TYPE_OPTIONS
    const subGradeOptions = computed(() => buildSubGradeOptionsByGrade(dataForm.grade))
    
    // 職位名稱選項
    const empTitleOptions = [
      { value: 'Chief Executive Officer', label: '執行長 (CEO)' },
      { value: 'Vice President', label: '副總經理' },
      { value: 'Director', label: '協理/總監' },
      { value: 'Manager', label: '經理' },
      { value: 'Deputy Manager', label: '副理' },
      { value: 'Section Chief', label: '課長' },
      { value: 'Senior Engineer', label: '資深工程師' },
      { value: 'Engineer', label: '工程師' },
      { value: 'Senior Specialist', label: '資深專員' },
      { value: 'Specialist', label: '專員' },
      { value: 'Associate Specialist', label: '助理專員' },
      { value: 'Senior Accountant', label: '資深會計師' },
      { value: 'Accountant', label: '會計師' },
      { value: 'Sales Manager', label: '業務經理' },
      { value: 'Sales Representative', label: '業務代表' },
      { value: 'Administrative Assistant', label: '行政助理' },
      { value: 'HR Manager', label: '人資經理' },
      { value: 'IT Specialist', label: 'IT專員' },
      { value: 'Marketing Manager', label: '行銷經理' },
      { value: 'Customer Service', label: '客服人員' }
    ]
    // 月份選擇暫存（YYYY-MM）
    const earliestCrLineMonth = ref('')
    const issueMonth = ref('')
    
    // 表單驗證錯誤狀態
    const validationErrors = reactive<Set<string>>(new Set())
    const showValidationAlert = ref(false)

    const monthAbbrevs = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] as const
    
    // 隨機生成日期 (格式: Mon-YYYY)
    const generateRandomDate = (startYear: number, endYear: number): string => {
      const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear
      const monthIdx = Math.floor(Math.random() * 12)
      return `${monthAbbrevs[monthIdx]}-${year}`
    }
    const formatToMonYY = (ym: string): string => {
      if (!ym) return ''
      const [y,m] = ym.split('-')
      const idx = parseInt(m,10)-1
      return `${monthAbbrevs[idx]}-${y}`
    }
    const normalizeEmpLength = (raw: string): string => {
      const v = raw.trim()
      if (!v) return ''
      if (v === '<1' || v === '<1 year') return '<1 year'
      if (v.endsWith('+')) return `${v} years`
      if (/^\d+$/.test(v)) return `${v} years`
      // 若已含 year(s) 直接返回
      return v.includes('year') ? v : `${v} years`
    }
    
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
      
      // 清除驗證錯誤
      validationErrors.clear()
      showValidationAlert.value = false
      
      // 隨機選擇職位
      const randomEmpTitle = empTitleOptions[Math.floor(Math.random() * empTitleOptions.length)].value
      
      // 生成隨機日期
      const randomEarliestCrLine = generateRandomDate(1990, 2020)
      const randomIssueDate = generateRandomDate(2020, 2024)
      
      // 填充表單數據
      dataForm.loan_amnt = randomSample.loan_amnt
      dataForm.term = randomSample.term
      dataForm.int_rate = randomSample.int_rate
      dataForm.installment = randomSample.installment
      dataForm.grade = randomSample.sub_grade.charAt(0)
      dataForm.sub_grade = randomSample.sub_grade
      dataForm.emp_title = randomEmpTitle
      dataForm.emp_length = '5 years'
      dataForm.home_ownership = randomSample.home_ownership
      dataForm.annual_inc = randomSample.annual_inc
      dataForm.verification_status = randomSample.verification_status
      dataForm.issue_d = randomIssueDate
      dataForm.loan_status = ''
      dataForm.purpose = randomSample.purpose
      dataForm.dti = randomSample.dti
      dataForm.earliest_cr_line = randomEarliestCrLine
      earliestCrLineMonth.value = ''
      issueMonth.value = ''
      dataForm.open_acc = randomSample.open_acc
      dataForm.pub_rec = randomSample.pub_rec
      dataForm.revol_bal = randomSample.revol_bal
      dataForm.revol_util = randomSample.revol_util
      dataForm.total_acc = randomSample.total_acc
      dataForm.mort_acc = randomSample.mort_acc
      dataForm.pub_rec_bankruptcies = randomSample.pub_rec_bankruptcies
      // 正確映射 application_type: 從樣本的 value 轉為大寫標準值
      dataForm.application_type = randomSample.application_type.toUpperCase() === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'JOINT'
      dataForm.address = ''
      
      // 準備 LoanInput 格式並通知父組件
      // 正規化 application_type（樣本可能為 'Individual'）
      const normalizedAppType = ((): string => {
        const v = String(randomSample.application_type || '').toUpperCase()
        return v === 'INDIVIDUAL' || v === 'JOINT' ? v : 'INDIVIDUAL'
      })()
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
        earliest_cr_line: dataForm.earliest_cr_line,
        term: randomSample.term,
        grade: randomSample.sub_grade.charAt(0),
        emp_length: '5 years',
        home_ownership: randomSample.home_ownership,
        verification_status: randomSample.verification_status,
        purpose: randomSample.purpose,
        application_type: normalizedAppType,
        issue_d: undefined
      }
      
      // 發送 form-data-update 事件給父組件
      console.log('=== 即將 emit form-data-update ===')
      emit('form-data-update', loanInput)
      console.log('=== emit form-data-update 完成 ===')
      
      console.log('準備發送的 LoanInput:', loanInput)
      
      ElMessage.success('數據已生成!')
    }

    // 依目前表單值組裝 LoanInput 並送出（值以 API 需要的 value 為準，label 僅供顯示）
    const handleApplyForm = (): boolean => {
      // 清除舊的驗證錯誤
      validationErrors.clear()
      showValidationAlert.value = false
      
      // 基本檢核與轉型
      const toNum = (v: string) => Number(String(v).trim())
      const toInt = (v: string) => parseInt(String(v).trim(), 10)

      const requiredFields: Array<[string, string, string]> = [
        ['loan_amnt', dataForm.loan_amnt, '貸款金額'],
        ['term', dataForm.term, '期限/期數'],
        ['int_rate', dataForm.int_rate, '利率'],
        ['installment', dataForm.installment, '分期付款金額'],
        ['grade', dataForm.grade, '貸款等級'],
        ['sub_grade', dataForm.sub_grade, '貸款子等級'],
        ['emp_title', dataForm.emp_title, '職位名稱'],
        ['emp_length', dataForm.emp_length, '職位年資'],
        ['home_ownership', dataForm.home_ownership, '房屋所有權'],
        ['annual_inc', dataForm.annual_inc, '年收入'],
        ['verification_status', dataForm.verification_status, '驗證狀態'],
        ['issue_d', dataForm.issue_d, '核發月份'],
        ['application_type', dataForm.application_type, '申請類型'],
        ['purpose', dataForm.purpose, '目的'],
        ['dti', dataForm.dti, '債務收入比'],
        ['earliest_cr_line', dataForm.earliest_cr_line, '最早信用紀錄月份'],
        ['open_acc', dataForm.open_acc, '開立帳戶數'],
        ['pub_rec', dataForm.pub_rec, '公共紀錄'],
        ['revol_bal', dataForm.revol_bal, '循環餘額'],
        ['revol_util', dataForm.revol_util, '循環使用率'],
      ]

      // 檢核所有必填欄位
      requiredFields.forEach(([key, value, label]) => {
        if (!String(value || '').trim()) {
          validationErrors.add(key)
        }
      })

      // 如果有驗證錯誤,顯示提示並返回
      if (validationErrors.size > 0) {
        showValidationAlert.value = true
        // 滾動到表單頂部
        nextTick(() => {
          const dialogBody = document.querySelector('.data-gen-dialog .el-dialog__body')
          if (dialogBody) {
            dialogBody.scrollTop = 0
          }
        })
        return false
      }
      
      // 數字驗證
      const requiredNumbers: Array<[string, number]> = [
        ['loan_amnt', toNum(dataForm.loan_amnt)],
        ['int_rate', toNum(dataForm.int_rate)],
        ['installment', toNum(dataForm.installment)],
        ['annual_inc', toNum(dataForm.annual_inc)],
        ['dti', toNum(dataForm.dti)],
        ['open_acc', toInt(dataForm.open_acc)],
        ['pub_rec', toInt(dataForm.pub_rec)],
        ['revol_bal', toNum(dataForm.revol_bal)],
        ['revol_util', toNum(dataForm.revol_util)],
        ['total_acc', toInt(dataForm.total_acc)],
        ['mort_acc', toInt(dataForm.mort_acc)],
        ['pub_rec_bankruptcies', toInt(dataForm.pub_rec_bankruptcies)],
      ]

      // 檢核數字
      const invalidNum = requiredNumbers.find(([k, n]) => Number.isNaN(n))
      if (invalidNum) {
        ElMessage.error(`數值欄位格式錯誤：${invalidNum[0]}`)
        return false
      }

      // 若使用月份選擇覆蓋原文字輸入
      if (earliestCrLineMonth.value) {
        dataForm.earliest_cr_line = formatToMonYY(earliestCrLineMonth.value)
      }
      if (issueMonth.value) {
        dataForm.issue_d = formatToMonYY(issueMonth.value)
      }
      // 正規化職位年資
      dataForm.emp_length = normalizeEmpLength(dataForm.emp_length)
      // 正規化申請類型（確保送出為大寫值）
      if (dataForm.application_type) {
        dataForm.application_type = String(dataForm.application_type).toUpperCase()
      }

      const loanInput: LoanInput = {
        loan_amnt: requiredNumbers.find(([k]) => k === 'loan_amnt')![1],
        int_rate: requiredNumbers.find(([k]) => k === 'int_rate')![1],
        installment: requiredNumbers.find(([k]) => k === 'installment')![1],
        sub_grade: dataForm.sub_grade,
        annual_inc: requiredNumbers.find(([k]) => k === 'annual_inc')![1],
        dti: requiredNumbers.find(([k]) => k === 'dti')![1],
        open_acc: requiredNumbers.find(([k]) => k === 'open_acc')![1] as number,
        pub_rec: requiredNumbers.find(([k]) => k === 'pub_rec')![1] as number,
        revol_bal: requiredNumbers.find(([k]) => k === 'revol_bal')![1],
        revol_util: requiredNumbers.find(([k]) => k === 'revol_util')![1],
        total_acc: requiredNumbers.find(([k]) => k === 'total_acc')![1] as number,
        mort_acc: requiredNumbers.find(([k]) => k === 'mort_acc')![1] as number,
        pub_rec_bankruptcies: requiredNumbers.find(([k]) => k === 'pub_rec_bankruptcies')![1] as number,
        earliest_cr_line: String(dataForm.earliest_cr_line).trim(),
        term: dataForm.term,
        grade: dataForm.grade,
        emp_length: dataForm.emp_length,
        home_ownership: dataForm.home_ownership,
        verification_status: dataForm.verification_status,
        purpose: dataForm.purpose,
        application_type: dataForm.application_type,
        issue_d: dataForm.issue_d || undefined
      }

      emit('form-data-update', loanInput)
      ElMessage.success('已套用目前表單內容')
      
      // 清除驗證錯誤
      validationErrors.clear()
      showValidationAlert.value = false
      
      dataDialogVisible.value = false
      return true
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
      if (!canSend.value || props.disabled) return
      const sendFiles = files.map(({ id, name, size, type, url }) => ({ id, name, size, type, url }))
      emit('send', { text: text.value.trim(), files: sendFiles })
      text.value = ''
      files.splice(0, files.length)
    }
    const handleSubmitAndChat = () => {
      // 先套用目前表單內容到父層的 formdata
      const isValid = handleApplyForm()
      // 只有在驗證通過時才發送訊息
      if (isValid) {
        emit('send', { text: '請用表單數據執行分析', files: [] })
      }
    }
  const handleModelChange = (model: string) => { setModel(model) }
  // 初始模型通知（保險同步一次）
  emit('model-change', selectedModel.value)
      return { 
      text, files, fileInput, selectedModel, modelOptions, 
      triggerFileInput, handleFileChange, removeFile, handleSend, handleModelChange, canSend, isImage,
      dataDialogVisible, dataForm, openDataDialog, handleDataGenerate,
      termOptions, gradeOptions, homeOwnershipOptions, verificationStatusOptions, purposeOptions, subGradeOptions, applicationTypeOptions,
      empTitleOptions,
      earliestCrLineMonth, issueMonth,
      handleApplyForm,
      handleSubmitAndChat,
      isMobile,
      dialogWidth,
      validationErrors,
      showValidationAlert
    }
  }
}
</script>

<style scoped>
/* 左側對齊與寬度限制調整 */
.chat-input-container { padding: 0; background-color: transparent; display: flex; flex-direction: column; gap: 10px; transition: background-color .35s ease; }
.input-wrapper { position: relative; width: 100%; }
.file-input { display: none; }
.upload-btn-inside { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); z-index: 1; --el-button-bg-color: var(--button-bg); --el-button-hover-bg-color: var(--el-color-primary-dark-2); --el-button-active-bg-color: var(--el-color-primary); transition: background-color 0.25s ease, filter 0.25s ease; }
.upload-btn-inside:hover:not(:disabled) { filter: brightness(1.12); }
.upload-btn-inside:active:not(:disabled) { filter: brightness(0.92); }
.input-textarea :deep(.el-textarea__inner) { border-radius: 20px; background-color: var(--card-bg); color: var(--text-color); box-shadow: 0 0 0 1px var(--border-color); padding-left: 20px; padding-right: 240px; transition: box-shadow .25s ease, background-color .35s ease, color .35s ease; }
.input-textarea :deep(.el-textarea__inner::placeholder) { color: rgba(0,0,0,0.35); }
.input-textarea :deep(.el-textarea__inner:focus) { box-shadow: 0 0 0 1px var(--el-color-primary), 0 0 0 3px rgba(124,58,237,0.35); }
.input-textarea :deep(.el-input__count) { color: rgba(0, 0, 0, 0.5); font-size: 12px; background: transparent; transition: color .35s ease; }
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

/* 資料生成按鈕 - 與 ModelSelector 一致的設計 */
.data-gen-btn {
  position: absolute;
  right: 190px;
  top: 80%;
  transform: translateY(-50%) translateY(-8px);
  height: auto;
  font-size: 13px;
  z-index: 2;
  --el-button-bg-color: var(--button-bg);
  --el-button-hover-bg-color: var(--el-color-primary-dark-2);
  --el-button-active-bg-color: var(--el-color-primary);
  transition: background-color .25s ease, filter .25s ease;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  cursor: pointer;
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

/* 增強 Select 下拉層級與樣式，避免被 Dialog 或其他容器遮蔽 */
:deep(.el-select__popper),
:deep(.data-gen-popper) {
  z-index: 9999 !important;
}

:deep(.el-popper) {
  z-index: 9999 !important;
}

/* 日期選擇器 Popper 樣式 */
:deep(.el-picker__popper) {
  z-index: 9999 !important;
}

:deep(.el-date-picker) {
  z-index: 9999 !important;
}

:deep(.el-picker-panel) {
  z-index: 9999 !important;
}

/* 確保 Dialog 內的下拉選單可正常顯示 */
:deep(.el-dialog__body) {
  overflow: visible !important;
}

:deep(.data-gen-dialog .el-dialog__body) {
  overflow-y: auto !important;
  overflow-x: visible !important;
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
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.dialog-footer .left-actions { display: flex; gap: 12px; }
.dialog-footer .right-actions { display: flex; gap: 12px; }

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

/* USD 幣別後綴樣式 - macOS 風格 */
.currency-suffix {
  color: #86868b;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.3px;
  padding: 0 2px;
  user-select: none;
  transition: color 0.2s ease;
}

/* 深色模式下的幣別樣式 */
:deep(.dark) .currency-suffix {
  color: #98989d;
}

/* Input append 區域樣式優化 */
:deep(.el-input-group__append) {
  background-color: rgba(0, 0, 0, 0.02);
  border-color: var(--border-color);
  padding: 0 12px;
  transition: all 0.2s ease;
}

:deep(.dark .el-input-group__append) {
  background-color: rgba(255, 255, 255, 0.04);
}

/* Focus 狀態下的 append 區域 */
:deep(.el-input.is-focus .el-input-group__append) {
  border-color: #409eff;
  background-color: rgba(64, 158, 255, 0.05);
}

:deep(.el-input.is-focus) .currency-suffix {
  color: #409eff;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-radio__label) {
  color: var(--text-color);
}

/* 驗證錯誤樣式 */
.validation-alert {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  border-left: 4px solid #f56c6c;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.15);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.validation-alert-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.validation-alert-icon {
  color: #f56c6c;
  font-size: 18px;
  flex-shrink: 0;
}

.validation-alert-text {
  color: #f56c6c;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

/* 驗證錯誤的表單項目樣式 - 只標記 Label 為紅色 */
.validation-error :deep(.el-form-item__label) {
  color: #f56c6c !important;
  transition: color 0.3s ease;
}

/* ========== 手機版 RWD 優化 ========== */
@media (max-width: 768px) {
  /* Dialog 全螢幕樣式優化 */
  :deep(.data-gen-dialog) {
    margin: 0 !important;
  }
  
  :deep(.data-gen-dialog.is-fullscreen) {
    width: 100vw !important;
    height: 100vh !important;
    border-radius: 0 !important;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  :deep(.data-gen-dialog.is-fullscreen .el-dialog__header) {
    flex-shrink: 0;
  }
  
  :deep(.data-gen-dialog .el-dialog__header) {
    padding: 16px 20px;
    margin: 0;
  }
  
  :deep(.data-gen-dialog .el-dialog__body) {
    padding: 20px 16px;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: calc(100vh - 140px);
  }
  
  :deep(.data-gen-dialog.is-fullscreen .el-dialog__body) {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 20px 16px 100px 16px;
    -webkit-overflow-scrolling: touch;
  }
  
  :deep(.data-gen-dialog .el-dialog__footer) {
    padding: 12px 16px;
    margin: 0;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  }
  
  :deep(.data-gen-dialog.is-fullscreen .el-dialog__footer) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    flex-shrink: 0;
    padding: 12px 16px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
    margin: 0;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    z-index: 10;
  }
  
  :deep(.dark .data-gen-dialog.is-fullscreen .el-dialog__footer) {
    background: rgba(30, 30, 30, 0.85);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.3);
  }
  
  /* 表單容器 */
  .dialog-form-container {
    width: 100%;
    padding: 0;
  }
  
  /* 表單改為縱向排列 */
  .data-gen-form {
    width: 100%;
  }
  
  /* el-row 移除間距,改為垂直堆疊 */
  .data-gen-form :deep(.el-row) {
    display: flex !important;
    flex-direction: column !important;
    margin: 0 !important;
    gap: 0 !important;
  }
  
  /* el-col 全寬顯示 */
  .data-gen-form :deep(.el-col) {
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  /* 表單項目間距與佈局 */
  .data-gen-form :deep(.el-form-item) {
    margin-bottom: 20px !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  /* Label 在上方顯示 */
  .data-gen-form :deep(.el-form-item__label) {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    text-align: left !important;
    margin-bottom: 8px !important;
    padding: 0 !important;
    line-height: 1.5 !important;
    float: none !important;
    font-weight: 500;
  }
  
  /* 表單內容區域 */
  .data-gen-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  
  /* 輸入框、選擇器、日期選擇器全寬 */
  .data-gen-form :deep(.el-input),
  .data-gen-form :deep(.el-select),
  .data-gen-form :deep(.el-date-picker) {
    width: 100% !important;
    max-width: 100% !important;
  }
  
  .data-gen-form :deep(.el-input__wrapper) {
    width: 100% !important;
  }
  
  .data-gen-form :deep(.el-select .el-input) {
    width: 100% !important;
  }
  
  /* Dialog footer 按鈕單列橫向排列 */
  .dialog-footer {
    flex-direction: row;
    gap: 8px;
    width: 100%;
    align-items: center;
  }
  
  .dialog-footer .left-actions {
    flex: 2;
    display: flex;
  }
  
  .dialog-footer .left-actions .el-button {
    width: 100%;
    margin: 0 !important;
    height: 48px;
    font-size: 15px;
    font-weight: 500;
  }
  
  .dialog-footer .right-actions {
    flex: 1;
    display: flex;
    gap: 8px;
  }
  
  .dialog-footer .right-actions .el-button {
    flex: 1;
    margin: 0 !important;
    height: 48px;
    font-size: 14px;
    font-weight: 500;
  }
  
  /* 手機版 USD 幣別樣式優化 */
  .currency-suffix {
    font-size: 12px;
    padding: 0 1px;
  }
  
  :deep(.el-input-group__append) {
    padding: 0 10px;
    min-width: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* 小螢幕手機優化 */
@media (max-width: 480px) {
  :deep(.data-gen-dialog .el-dialog__header) {
    padding: 14px 16px;
  }
  
  :deep(.data-gen-dialog .el-dialog__title) {
    font-size: 16px;
  }
  
  :deep(.data-gen-dialog .el-dialog__body) {
    padding: 16px 12px;
    max-height: calc(100vh - 130px);
  }
  
  :deep(.data-gen-dialog .el-dialog__footer) {
    padding: 10px 12px;
  }
  
  .data-gen-form :deep(.el-form-item) {
    margin-bottom: 18px !important;
  }
  
  .data-gen-form :deep(.el-form-item__label) {
    font-size: 14px;
    margin-bottom: 6px !important;
  }
  
  .data-gen-form :deep(.el-input__inner),
  .data-gen-form :deep(.el-input__wrapper) {
    font-size: 16px !important;
  }
  
  .dialog-footer .el-button {
    height: 42px;
    font-size: 14px;
  }
}
</style>

<style>
/* 全局樣式 - 手機版固定底部按鈕 */
@media (max-width: 768px) {
  /* Dialog 容器設為 flex 佈局 */
  .el-dialog__wrapper.is-fullscreen {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  
  .el-dialog__wrapper.is-fullscreen .data-gen-dialog {
    display: flex !important;
    flex-direction: column !important;
    height: 100vh !important;
    max-height: 100vh !important;
    overflow: hidden !important;
    margin: 0 !important;
    width: 100vw !important;
  }
  
  /* Header 固定高度 */
  .el-dialog__wrapper.is-fullscreen .data-gen-dialog .el-dialog__header {
    flex-shrink: 0 !important;
    position: relative !important;
    z-index: 1 !important;
  }
  
  /* Body 可滾動區域 */
  .el-dialog__wrapper.is-fullscreen .data-gen-dialog .el-dialog__body {
    flex: 1 1 auto !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 20px 16px !important;
    padding-bottom: 100px !important;
    -webkit-overflow-scrolling: touch !important;
    position: relative !important;
  }
  
  /* Footer 固定在底部 - 使用多重選擇器強制覆蓋 */
  .el-dialog__wrapper.is-fullscreen .data-gen-dialog .el-dialog__footer,
  .el-dialog__wrapper.is-fullscreen .el-dialog__footer,
  .data-gen-dialog .el-dialog__footer {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    flex-shrink: 0 !important;
    padding: 12px 16px !important;
    padding-bottom: calc(12px + env(safe-area-inset-bottom)) !important;
    margin: 0 !important;
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.12) !important;
    border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
    z-index: 9999 !important;
    transform: translateZ(0) !important;
    -webkit-transform: translateZ(0) !important;
  }
  
  /* Debug: 臨時紅色背景確認元素位置 */
  .el-dialog__wrapper.is-fullscreen .data-gen-dialog .el-dialog__footer::before {
    content: '' !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    height: 2px !important;
    background: linear-gradient(to right, #ff0000, #ff6b6b) !important;
    z-index: 10000 !important;
  }
  
  .dark .el-dialog__wrapper.is-fullscreen .data-gen-dialog .el-dialog__footer {
    background: rgba(30, 30, 30, 0.95) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.12) !important;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.4) !important;
  }
}
</style>
