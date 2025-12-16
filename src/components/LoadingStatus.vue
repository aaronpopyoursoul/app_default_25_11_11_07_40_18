<template>
  <div class="loading-status">
    <div class="loading-icon">
      <el-icon class="rotating-icon"><Loading /></el-icon>
    </div>
    <transition name="fade-slide" mode="out-in">
      <div :key="currentMessage" class="loading-message">
        {{ currentMessage }}
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'LoadingStatus',
  components: {
    Loading
  },
  props: {
    type: {
      type: String as () => 'loan' | 'resume',
      default: 'loan'
    }
  },
  setup(props) {
    const currentMessage = ref('')
    const currentIndex = ref(0)
    let intervalId: number | null = null

    // 貸款分析的載入文字序列
    const loanMessages = [
      '系統解讀中...',
      '載入 PolicyLoader...',
      '匹配模型中...',
      '計算風險評分...',
      '分析資料中...',
      '生成建議中...'
    ]

    // 履歷評估的載入文字序列
    const resumeMessages = [
      '系統解讀中...',
      '解析 JD 需求...',
      '分析履歷內容...',
      '匹配模型中...',
      '比對技能與經驗...',
      '生成分析報告...'
    ]

    const messages = props.type === 'loan' ? loanMessages : resumeMessages
    
    // 根據類型計算切換間隔 (貸款: 1.67秒, 履歷: 8秒)
    const interval = props.type === 'loan' ? 1670 : 8000

    const updateMessage = () => {
      currentMessage.value = messages[currentIndex.value]
      
      // 如果還沒到最後一個,繼續切換
      if (currentIndex.value < messages.length - 1) {
        currentIndex.value++
      }
      // 到達最後一個後停止切換,但保持顯示
    }

    onMounted(() => {
      // 立即顯示第一條訊息
      updateMessage()
      
      // 定時切換,到最後一個後停止
      intervalId = window.setInterval(() => {
        if (currentIndex.value < messages.length - 1) {
          updateMessage()
        } else {
          // 已到最後一個,清除定時器
          if (intervalId !== null) {
            clearInterval(intervalId)
            intervalId = null
          }
        }
      }, interval)
    })

    onUnmounted(() => {
      if (intervalId !== null) {
        clearInterval(intervalId)
      }
    })

    // 當 type 改變時重置
    watch(() => props.type, () => {
      if (intervalId !== null) {
        clearInterval(intervalId)
      }
      currentIndex.value = 0
      updateMessage()
      
      // 重新啟動定時器,根據類型使用不同間隔
      const newInterval = props.type === 'loan' ? 1670 : 8000
      intervalId = window.setInterval(() => {
        if (currentIndex.value < messages.length - 1) {
          updateMessage()
        } else {
          if (intervalId !== null) {
            clearInterval(intervalId)
            intervalId = null
          }
        }
      }, newInterval)
    })

    return {
      currentMessage
    }
  }
})
</script>

<style scoped>
.loading-status {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(90, 200, 250, 0.1) 0%, rgba(74, 184, 234, 0.1) 100%);
  border-radius: 12px;
  margin: 10px 0;
  animation: pulse-container 2s ease-in-out infinite;
  width: fit-content;
  max-width: 100%;
}

.loading-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rotating-icon {
  font-size: 24px;
  color: #5AC8FA;
  animation: rotate 1.5s linear infinite;
}

.loading-message {
  font-size: 14px;
  font-weight: 500;
  color: #2C5F7F;
  letter-spacing: 0.3px;
  white-space: nowrap;
  min-width: fit-content;
}

/* 淡入淡出動畫 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-enter-to,
.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

/* 旋轉動畫 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 容器脈衝動畫 */
@keyframes pulse-container {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(90, 200, 250, 0.2);
  }
  50% {
    box-shadow: 0 4px 16px rgba(90, 200, 250, 0.35);
  }
}

/* 深色模式適配 */
@media (prefers-color-scheme: dark) {
  .loading-status {
    background: linear-gradient(135deg, rgba(90, 200, 250, 0.15) 0%, rgba(74, 184, 234, 0.15) 100%);
  }
  
  .loading-message {
    color: #7DD3FC;
  }
}
</style>
