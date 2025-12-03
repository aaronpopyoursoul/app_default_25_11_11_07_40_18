<template>
  <transition name="guide-fade">
    <div v-if="visible" class="guide-overlay">
      <div class="guide-container">
        <!-- 關閉按鈕 -->
        <button class="close-btn" @click="closeGuide">
          <el-icon><Close /></el-icon>
        </button>

        <div class="guide-content">
          <!-- 左側：標題與介紹 -->
          <div class="guide-left">
            <div class="brand-badge">
              <el-icon class="badge-icon"><Star /></el-icon>
              <span>歡迎來到 WitSeeU</span>
            </div>
            
            <h1 class="guide-title">
              <span class="highlight">ALL in AI</span><br>
                <span class="highlight">智能分析</span><br>
                <span class="highlight">  的全新世代</span>
            </h1>
            
            <p class="guide-desc">
              透過先進的 AI 技術，徹底改變金融數據分析與人才招募的互動模式，為您帶來前所未有的智慧決策體驗。
            </p>
            
            <el-button type="primary" size="large" class="start-btn" @click="closeGuide">
              立即體驗
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>

          <!-- 右側：功能卡片 -->
          <div class="guide-right">
            <!-- 卡片 1: 貸款評估 -->
            <div class="feature-card card-loan" @click="navigateTo('/chat')">
              <div class="card-header">
                <span class="card-tag">Finance AI</span>
                <el-icon class="card-icon"><ChatDotRound /></el-icon>
              </div>
              <div class="card-body">
                <h3 class="card-title">個人貸款/還款能力智能評價系統</h3>
                <div class="card-stat">
                  <span class="stat-value">98%</span>
                  <span class="stat-label">Accuracy</span>
                </div>
              </div>
              <div class="card-footer">
                <span>預測客戶還款能力</span>
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>

            <!-- 卡片 2: CSR 履歷 -->
            <div class="feature-card card-csr" @click="navigateTo('/csr')">
              <div class="card-header">
                <span class="card-tag">HR Tech</span>
                <el-icon class="card-icon"><User /></el-icon>
              </div>
              <div class="card-body">
                <h3 class="card-title">人才技能量化及精準洞察系統</h3>
                <div class="card-stat">
                  <span class="stat-value">+45%</span>
                  <span class="stat-label">Efficiency</span>
                </div>
              </div>
              <div class="card-footer">
                <span>精準配對職缺人才</span>
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Close, ArrowRight, Star, ChatDotRound, User } from '@element-plus/icons-vue'

const visible = ref(false)
const router = useRouter()

const emit = defineEmits(['close', 'open'])

onMounted(() => {
  // 檢查是否已經顯示過 (這裡為了演示效果，暫時每次都顯示，或者使用 SessionStorage)
  // 實際專案可以使用 localStorage.getItem('hasSeenGuide')
  const hasSeen = sessionStorage.getItem('hasSeenGuide')
  if (!hasSeen) {
    // 立即通知父組件即將開啟，避免子頁面導覽視窗搶先顯示
    emit('open')
    setTimeout(() => {
      visible.value = true
    }, 500) // 延遲顯示，讓介面先載入
  }
})

const closeGuide = () => {
  visible.value = false
  sessionStorage.setItem('hasSeenGuide', 'true')
  emit('close')
}

const navigateTo = async (path: string) => {
  // 設定一次性的子導覽強制顯示旗標 (僅本次會話)
  try {
    const name = (path || '').replace(/^\//, '') || ''
    if (name === 'chat' || name === 'csr') {
      sessionStorage.setItem('pendingChildGuide', name)
    }
  } catch { /* noop */ }
  await router.push(path)
  closeGuide()
}

const open = () => {
  visible.value = true
  emit('open')
}

defineExpose({ open })
</script>

<style scoped>
.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.guide-container {
  width: 100%;
  max-width: 960px;
  background: rgba(20, 20, 20, 0.85); /* 深色背景參考圖片 */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  color: white;
}

/* 背景裝飾光暈 */
.guide-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -20%;
  width: 80%;
  height: 200%;
  background: radial-gradient(circle, rgba(0, 122, 255, 0.15) 0%, transparent 60%);
  transform: rotate(-15deg);
  pointer-events: none;
}

.guide-container::after {
  content: '';
  position: absolute;
  bottom: -50%;
  right: -20%;
  width: 80%;
  height: 200%;
  background: radial-gradient(circle, rgba(52, 199, 89, 0.1) 0%, transparent 60%);
  transform: rotate(-15deg);
  pointer-events: none;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.guide-content {
  display: flex;
  padding: 60px;
  gap: 60px;
  position: relative;
  z-index: 1;
}

/* 左側內容 */
.guide-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.guide-title {
  font-size: 48px;
  line-height: 1.1;
  font-weight: 700;
  margin: 0 0 24px 0;
  letter-spacing: -1px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
}

.highlight {
  background: linear-gradient(135deg, #0A84FF 0%, #30D158 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-style: italic;
  font-family: "Times New Roman", serif; /* 參考圖片的襯線體風格 */
}

.guide-desc {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 40px;
  max-width: 400px;
}

.start-btn {
  --el-button-bg-color: #0A84FF;
  --el-button-border-color: #0A84FF;
  --el-button-hover-bg-color: #0071e3;
  --el-button-hover-border-color: #0071e3;
  border-radius: 24px;
  padding: 12px 32px;
  font-weight: 600;
  height: auto;
}

/* 右側卡片 */
.guide-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-5px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.card-loan:hover {
  box-shadow: 0 12px 32px rgba(10, 132, 255, 0.15);
}

.card-csr:hover {
  box-shadow: 0 12px 32px rgba(48, 209, 88, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.card-tag {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-icon {
  font-size: 24px;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 12px;
  width: 40px;
  height: 40px;
  box-sizing: border-box;
}

.card-body {
  margin-bottom: 20px;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.card-stat {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -1px;
}

.card-loan .stat-value { color: #0A84FF; }
.card-csr .stat-value { color: #30D158; }

.stat-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

/* RWD */
@media (max-width: 768px) {
  .guide-content {
    flex-direction: column;
    padding: 32px 24px;
    gap: 32px;
  }
  
  .guide-title {
    font-size: 32px;
  }
  
  .guide-desc {
    font-size: 14px;
    margin-bottom: 24px;
  }
  
  .feature-card {
    padding: 20px;
  }
  
  .stat-value {
    font-size: 24px;
  }
}

/* Animations */
.guide-fade-enter-active,
.guide-fade-leave-active {
  transition: opacity 0.4s ease;
}

.guide-fade-enter-from,
.guide-fade-leave-to {
  opacity: 0;
}

.guide-fade-enter-active .guide-container {
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
