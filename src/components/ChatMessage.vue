<template>
  <div v-if="message.type === 'ai'" class="chat-message ai">
    <img :src="aiAvatar" alt="AI" class="avatar" />
    <div class="chat-bubble">
      <div class="content-text" v-if="message.content.text">
        <div v-if="isResultKind" v-html="renderResultTable(message.content.text)" class="result-table"></div>
        <div v-else-if="isUsageInfoKind" v-html="renderUsageInfo(message.content.text)" class="usage-info"></div>
        <div v-else-if="isHtmlContent" v-html="decodeHtml(message.content.text)" class="html-content"></div>
        <div v-else v-html="formatTextContent(message.content.text)" class="formatted-content"></div>
      </div>
      
      <!-- Prediction 風險評估顯示 -->
      <div v-if="message.content.prediction" class="prediction-card">
        <div class="prediction-header" @click="togglePrediction">
          <span class="prediction-title">💡 貸款風險評估</span>
          <el-icon class="collapse-icon" :class="{ collapsed: !isPredictionExpanded }">
            <ArrowDown />
          </el-icon>
        </div>
        <div class="prediction-body">
          <!-- 風險等級 - 永遠顯示 -->
          <div class="risk-level-section">
            <div :class="['risk-badge', getRiskClass(message.content.prediction.risk_level)]">
              <span class="risk-icon">{{ getRiskIcon(message.content.prediction.risk_level) }}</span>
              <span class="risk-text">{{ getRiskText(message.content.prediction.risk_level) }}</span>
            </div>
            <div class="probability-info">
              <div class="probability-label">還款機率</div>
              <div class="probability-value">{{ (message.content.prediction.probability * 100).toFixed(2) }}%</div>
            </div>
          </div>
          
          <!-- SHAP 重要特徵 - 可折疊 -->
          <transition name="slide-fade">
            <div v-if="isPredictionExpanded && message.content.prediction.shap_top_features && message.content.prediction.shap_top_features.length > 0" class="shap-features-section">
              <div class="shap-title">關鍵影響因素 (SHAP分析)</div>
              <div class="shap-features-list">
                <div 
                  v-for="(feature, index) in message.content.prediction.shap_top_features" 
                  :key="index"
                  class="shap-feature-item"
                >
                  <div class="feature-header">
                    <div class="feature-rank">{{ index + 1 }}</div>
                    <div class="feature-info">
                      <div class="feature-name">{{ feature.feature_cn }}</div>
                      <div class="feature-name-en">{{ feature.feature_en }}</div>
                    </div>
                  </div>
                  <div class="feature-impact">
                    <div class="impact-bar-container">
                      <div 
                        class="impact-bar" 
                        :style="{ width: getImpactWidth(feature.mean_abs_shap, message.content.prediction.shap_top_features) }"
                      ></div>
                    </div>
                    <div class="impact-value">{{ feature.mean_abs_shap.toFixed(4) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
      
      <div class="content-files" v-if="message.content.files && message.content.files.length">
        <template v-for="file in message.content.files" :key="file.id">
          <img v-if="isImage(file)" :src="file.url" alt="Image file" class="file-preview-image" />
          <div v-else class="file-preview-name" :title="file.name">📄 {{ file.name }}</div>
        </template>
      </div>
      
      <!-- 建議問題區塊 -->
      <div v-if="message.content.suggested_questions && message.content.suggested_questions.length > 0" class="suggested-questions">
        <div class="suggested-title">💡 您可能想問</div>
        <div class="questions-list">
          <button 
            v-for="(question, index) in message.content.suggested_questions" 
            :key="index"
            class="question-btn"
            @click="handleQuestionClick(question)"
          >
            {{ question }}
          </button>
        </div>
      </div>
      
      <div class="timestamp">{{ formattedTimestamp }}</div>
    </div>
  </div>
  <div v-else class="chat-message user">
    <div class="chat-bubble">
      <div class="content-text user-message-text" v-if="message.content.text" v-html="formatUserText(message.content.text)"></div>
      <div class="content-files" v-if="message.content.files && message.content.files.length">
        <template v-for="file in message.content.files" :key="file.id">
          <img v-if="isImage(file)" :src="file.url" alt="Image file" class="file-preview-image" />
          <div v-else class="file-preview-name" :title="file.name">📄 {{ file.name }}</div>
        </template>
      </div>
      <div v-if="message.content.meta?.formSnapshotId" class="form-snapshot-link">
        <button class="snapshot-link-btn" @click="emitShowForm(message.content.meta.formSnapshotId)">
            查看表單
        </button>
      </div>
      <div class="timestamp">{{ formattedTimestamp }}</div>
    </div>
    <img :src="userAvatar" alt="User" class="avatar" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import aiAvatar from '@/assets/avatar-ai.svg'
import userAvatar from '@/assets/avatar-chloe.jpg'
import type { ChatMessage as ChatMessageType, ChatFile } from '@/types/chat'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'ChatMessage',
  props: {
    message: {
      type: Object as () => ChatMessageType,
      required: true
    }
  },
  emits: ['show-form', 'send-question'],
  setup(props, { emit }){
    const formattedTimestamp = computed(() => {
      if (!props.message.timestamp) return ''
      const date = new Date(props.message.timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    const isImage = (file: ChatFile) => !!file.type && file.type.startsWith('image/')
    
    const isHtmlContent = computed(() => !!props.message.content.meta?.isHtml)
    const isResultKind = computed(() => props.message.content.meta?.messageKind === 'result')
    const isUsageInfoKind = computed(() => props.message.content.meta?.messageKind === 'usage-info')
    
    // 格式化使用者訊息文字 - 保留換行
    function formatUserText(text: string): string {
      if (!text) return ''
      // 將 \n 轉為 <br>，並保留原文
      return text.replace(/\n/g, '<br>')
    }
    
    // Prediction 折疊狀態
    const isPredictionExpanded = ref(true)
    
    // 切換 Prediction 展開/折疊
    const togglePrediction = () => {
      isPredictionExpanded.value = !isPredictionExpanded.value
    }
    
    // 格式化文字內容 - 處理 Markdown-like 語法
    function formatTextContent(text: string): string {
      if (!text) return ''
      
      let formatted = text
      
      // 1. 處理 **粗體** 語法
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-highlight">$1</strong>')
      
      // 2. 處理編號列表 (1. 、2. 等)
      formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm, '<li class="numbered-item"><span class="item-number">$1.</span> $2</li>')
      
      // 3. 處理無序列表 (- 開頭)
      formatted = formatted.replace(/^\s*-\s+(.+)$/gm, '<li class="bullet-item">$1</li>')
      
      // 4. 將連續的 <li> 包裹在 <ul> 或 <ol> 中
      formatted = formatted.replace(/(<li class="numbered-item">.*?<\/li>\s*)+/gs, '<ol class="formatted-list numbered">$&</ol>')
      formatted = formatted.replace(/(<li class="bullet-item">.*?<\/li>\s*)+/gs, '<ul class="formatted-list bulleted">$&</ul>')
      
      // 5. 處理段落 - \n\n 轉為段落分隔
      const paragraphs = formatted.split(/\n\n+/)
      formatted = paragraphs
        .map(para => {
          para = para.trim()
          if (!para) return ''
          // 如果已經是列表,不包裹 <p>
          if (para.startsWith('<ol') || para.startsWith('<ul')) {
            return para
          }
          // 處理單個 \n 為 <br>
          para = para.replace(/\n/g, '<br>')
          return `<p class="formatted-paragraph">${para}</p>`
        })
        .filter(p => p)
        .join('')
      
      return formatted
    }
    
    // 處理可能被轉義的 HTML - 多層解碼
    function decodeHtml(html: string): string {
      if (!html) return ''
      let decoded = html
      // 持續解碼直到沒有 HTML 實體為止
      let prevDecoded = ''
      while (decoded !== prevDecoded && (decoded.includes('&lt;') || decoded.includes('&gt;') || decoded.includes('&amp;'))) {
        prevDecoded = decoded
        const txt = document.createElement('textarea')
        txt.innerHTML = decoded
        decoded = txt.value
      }
      
      // 移除 Markdown 代碼塊標記 (```html 和 ```)
      decoded = decoded.replace(/^```html\s*/i, '').replace(/\s*```$/, '')
      
      return decoded
    }
    
    function renderResultTable(text: string): string {
      try {
        const parsed = JSON.parse(text)
        if (!Array.isArray(parsed) || parsed.length === 0) return `<pre>${text}</pre>`
        const keys = Object.keys(parsed[0])
        let html = '<table class="result-data-table"><thead><tr>'
        keys.forEach(k => { html += `<th>${k}</th>` })
        html += '</tr></thead><tbody>'
        parsed.forEach(row => {
          html += '<tr>'
          keys.forEach(k => { html += `<td>${row[k] ?? '-'}</td>` })
          html += '</tr>'
        })
        html += '</tbody></table>'
        return html
      } catch {
        return `<pre>${text}</pre>`
      }
    }
    
    function renderUsageInfo(text: string): string {
      const lines = text.split('\n').filter(l => l.trim().length)
      let html = '<div class="usage-info-grid">'
      lines.forEach(line => {
        if (line.includes('---')) {
          html += '<hr class="section-divider" />'
        } else if (line.includes('：') || line.includes(':')) {
          const parts = line.split(/[：:]/)
          if (parts.length === 2) {
            let value = parts[1].trim()
            // 為 token 數值加千分位
            if (parts[0].trim().toLowerCase().includes('token')) {
              const num = parseInt(value.replace(/[^\d]/g, ''))
              if (!isNaN(num)) {
                value = num.toLocaleString('en-US')
              }
            }
            html += `<div class="info-row"><span class="label">${parts[0].trim()}</span><span class="value">${value}</span></div>`
          } else {
            html += `<div class="info-line">${line}</div>`
          }
        } else {
          html += `<div class="info-header">${line}</div>`
        }
      })
      html += '</div>'
      return html
    }
    
    // Prediction 相關函數
    const getRiskText = (riskLevel: string): string => {
      const riskMap: Record<string, string> = {
        'LOW': '低風險',
        'MEDIUM': '中風險',
        'HIGH': '高風險'
      }
      return riskMap[riskLevel] || riskLevel
    }
    
    const getRiskIcon = (riskLevel: string): string => {
      const iconMap: Record<string, string> = {
        'LOW': '✅',
        'MEDIUM': '⚠️',
        'HIGH': '🚨'
      }
      return iconMap[riskLevel] || '❓'
    }
    
    const getRiskClass = (riskLevel: string): string => {
      const classMap: Record<string, string> = {
        'LOW': 'risk-low',
        'MEDIUM': 'risk-medium',
        'HIGH': 'risk-high'
      }
      return classMap[riskLevel] || ''
    }
    
    const getImpactWidth = (value: number, features: any[]): string => {
      if (!features || features.length === 0) return '0%'
      const maxValue = Math.max(...features.map(f => f.mean_abs_shap))
      const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
      return `${percentage}%`
    }
    
    const emitShowForm = (id: string) => emit('show-form', id)
    
    // 處理建議問題點擊
    const handleQuestionClick = (question: string) => {
      emit('send-question', question)
    }

    return { 
      aiAvatar, userAvatar, formattedTimestamp, isImage, 
      isHtmlContent, isResultKind, isUsageInfoKind,
      formatTextContent, formatUserText, renderResultTable, renderUsageInfo, decodeHtml,
      getRiskText, getRiskIcon, getRiskClass, getImpactWidth,
      isPredictionExpanded, togglePrediction,
      ArrowDown, ArrowUp, emitShowForm, handleQuestionClick
    }
  }
})
</script>

<style scoped>
.chat-message{ display:flex; align-items:flex-start; gap:8px; margin:10px 0; }
.chat-message.ai{ justify-content:flex-start; }
.chat-message.user{ justify-content:flex-end; }
.avatar{ width:40px; height:40px; border-radius:50%; object-fit:cover; background:var(--card-bg); box-shadow:0 1px 3px rgba(0,0,0,.15); flex-shrink:0; }
.chat-bubble{ position:relative; max-width:80%; min-width:120px; display:inline-block; padding:10px 14px 18px; background:var(--ai-msg-bg); border-radius:16px; box-shadow:0 1px 3px rgba(0,0,0,.12); word-break:break-word; line-height:1.4; animation:bubbleIn .35s ease; }
.chat-message.user .chat-bubble{ background:var(--user-msg-bg); }
.chat-message.ai .chat-bubble:before,.chat-message.user .chat-bubble:before{ content:''; position:absolute; top:14px; width:12px; height:12px; background:currentColor; transform:rotate(45deg); }
.chat-message.ai .chat-bubble{ color:var(--ai-msg-bg); }
.chat-message.user .chat-bubble{ color:var(--user-msg-bg); }
.chat-message.ai .chat-bubble:before{ left:-5px; }
.chat-message.user .chat-bubble:before{ right:-5px; }
.content-text,.file-preview-name{ color:var(--text-color); }
.content-files{ display:flex; flex-wrap:wrap; gap:8px; margin-top:6px; }
.file-preview-image{ width:120px; height:90px; object-fit:cover; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,.18); }
.file-preview-name{ background:rgba(0,0,0,.08); padding:4px 8px; border-radius:6px; font-size:12px; max-width:140px; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; }
.timestamp{ position:absolute; right:10px; bottom:4px; font-size:11px; opacity:.55; color:var(--text-color); user-select:none; }
.form-snapshot-link{ margin-top:6px; }
.snapshot-link-btn{
  background: transparent;
  color: #0A84FF;
  border: none;
  padding: 0;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
}
.snapshot-link-btn:hover{ color: #007AFF; }
.link-icon{ margin-right: 4px; filter: drop-shadow(0 1px 1px rgba(0,0,0,.12)); }

/* HTML content styling */
:deep(.html-content){ line-height:1.6; }
:deep(.html-content h2){ font-size:1.1em; font-weight:600; margin:8px 0 6px; color:var(--text-color); }
:deep(.html-content p){ margin:4px 0; line-height:1.5; color:var(--text-color); }
:deep(.html-content ul, .html-content ol){ 
  margin:6px 0; 
  padding-left:24px; 
  list-style: none;
}
:deep(.html-content li){ 
  margin:3px 0; 
  color:var(--text-color);
  line-height: 1.6;
}
:deep(.html-content strong){ font-weight:600; color:var(--text-color); }
:deep(.html-content em){ font-style:italic; }
:deep(.html-content code){ background:rgba(0,0,0,.08); padding:2px 6px; border-radius:3px; font-family:monospace; font-size:0.9em; }

/* Formatted content styling - 處理 Markdown-like 格式 */
:deep(.formatted-content){ line-height:1.7; color:var(--text-color); }

/* 段落樣式 */
:deep(.formatted-paragraph){ margin:0 0 12px 0; line-height:1.7; }
:deep(.formatted-paragraph:last-child){ margin-bottom:0; }

/* 粗體高亮樣式 */
:deep(.text-highlight){ 
  font-weight:700; 
  font-size:1.05em; 
  color:var(--el-color-primary); 
  letter-spacing:0.3px;
}

/* 列表樣式 */
:deep(.formatted-list){ 
  margin:8px 0; 
  padding-left:0; 
  list-style:none; 
}

:deep(.formatted-list.numbered){ 
  counter-reset:item; 
}

:deep(.formatted-list li){ 
  margin:2px 0; 
  padding:2px 12px; 
  background:rgba(0,0,0,.03); 
  border-radius:6px; 
  line-height:1.6;
  transition:background 0.2s ease;
}

:deep(.formatted-list li:hover){ 
  background:rgba(0,0,0,.06); 
}

/* 編號列表項目 */
:deep(.numbered-item){ 
  display:flex; 
  gap:8px; 
  align-items:flex-start;
}

:deep(.item-number){ 
  font-weight:700; 
  color:var(--el-color-primary); 
  min-width:24px;
  flex-shrink:0;
}

/* 無序列表項目 */
:deep(.bullet-item){ 
  padding-left:24px; 
  position:relative;
}

:deep(.bullet-item::before){ 
  content:'•'; 
  position:absolute; 
  left:10px; 
  top:8px;
  color:var(--el-color-primary); 
  font-size:1.1em; 
  font-weight:700;
  line-height:1.6;
  pointer-events:none;
  user-select:none;
}

/* Result table styling */
:deep(.result-data-table){ width:100%; border-collapse:collapse; margin:8px 0; font-size:13px; background:var(--card-bg); border-radius:6px; overflow:hidden; }
:deep(.result-data-table th){ background:var(--el-color-primary-light-8); color:var(--text-color); padding:8px; text-align:left; font-weight:600; border-bottom:2px solid var(--border-color); }
:deep(.result-data-table td){ padding:6px 8px; border-bottom:1px solid var(--border-color); color:var(--text-color); }
:deep(.result-data-table tr:last-child td){ border-bottom:none; }
:deep(.result-data-table tr:hover){ background:rgba(0,0,0,.03); }

/* Result table 手機版 RWD 優化 */
@media (max-width: 768px) {
  /* 結果表格容器 - 添加橫向滾動 */
  :deep(.result-table) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 8px -12px;
    padding: 0 12px;
  }
  
  /* 滾動提示 */
  :deep(.result-table::after) {
    content: '← 左右滑動查看更多 →';
    display: block;
    text-align: center;
    font-size: 11px;
    color: var(--text-color);
    opacity: 0.5;
    margin-top: 8px;
    font-style: italic;
  }
  
  /* 表格本身 */
  :deep(.result-data-table) {
    min-width: 600px;
    font-size: 12px;
  }
  
  /* 第一列固定 (sticky) */
  :deep(.result-data-table th:first-child),
  :deep(.result-data-table td:first-child) {
    position: sticky;
    left: 0;
    background: var(--card-bg);
    z-index: 2;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  }
  
  :deep(.result-data-table th:first-child) {
    background: var(--el-color-primary-light-8);
    z-index: 3;
  }
  
  /* 表頭固定 */
  :deep(.result-data-table thead th) {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--el-color-primary-light-8);
  }
  
  /* 調整單元格內邊距 */
  :deep(.result-data-table th),
  :deep(.result-data-table td) {
    padding: 10px 12px;
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  :deep(.result-table) {
    margin: 8px -10px;
    padding: 0 10px;
  }
  
  :deep(.result-data-table) {
    font-size: 11px;
  }
  
  :deep(.result-data-table th),
  :deep(.result-data-table td) {
    padding: 8px 10px;
  }
  
  :deep(.result-table::after) {
    font-size: 10px;
    margin-top: 6px;
  }
}

/* Usage info grid styling */
:deep(.usage-info-grid){ display:flex; flex-direction:column; gap:6px; margin:4px 0; }
:deep(.usage-info-grid .info-header){ font-weight:600; font-size:14px; color:var(--text-color); margin-top:6px; }
:deep(.usage-info-grid .info-row){ display:flex; justify-content:space-between; padding:4px 0; gap:12px; }
:deep(.usage-info-grid .info-row .label){ color:var(--text-color); opacity:.8; font-size:13px; }
:deep(.usage-info-grid .info-row .value){ color:var(--text-color); font-weight:500; font-size:13px; }
:deep(.usage-info-grid .section-divider){ margin:8px 0; border:none; border-top:1px solid var(--border-color); }
:deep(.usage-info-grid .info-line){ color:var(--text-color); font-size:13px; padding:2px 0; }

@keyframes bubbleIn{ 0%{ opacity:0; transform: translateY(4px);} 100%{ opacity:1; transform: translateY(0);} }

/* Prediction Card 樣式 */
.prediction-card {
  margin-top: 12px;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(147, 51, 234, 0.05) 100%);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 12px;
  overflow: hidden;
  animation: slideIn 0.4s ease;
}

.prediction-header {
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(147, 51, 234, 0.08) 100%);
  border-bottom: 1px solid rgba(124, 58, 237, 0.15);
  cursor: pointer;
  user-select: none;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.prediction-header:hover {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.18) 0%, rgba(147, 51, 234, 0.12) 100%);
}

.prediction-header:active {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.22) 0%, rgba(147, 51, 234, 0.15) 100%);
}

.prediction-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 6px;
}

.collapse-icon {
  font-size: 18px;
  color: var(--el-color-primary);
  transition: transform 0.3s ease;
}

.collapse-icon.collapsed {
  transform: rotate(-180deg);
}

.prediction-body {
  padding: 16px;
}

/* 風險等級區域 */
.risk-level-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(124, 58, 237, 0.15);
}

.risk-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.risk-badge:hover {
  transform: translateY(-1px);
}

.risk-badge.risk-low {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.risk-badge.risk-medium {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.risk-badge.risk-high {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.risk-icon {
  font-size: 20px;
}

.risk-text {
  font-size: 16px;
  letter-spacing: 0.5px;
}

.probability-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.probability-label {
  font-size: 12px;
  color: var(--text-color);
  opacity: 0.7;
  font-weight: 500;
}

.probability-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-color-primary);
  background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* SHAP 特徵區域 */
.shap-features-section {
  margin-top: 12px;
}

.shap-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(124, 58, 237, 0.2);
}

.shap-features-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shap-feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.feature-rank {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);
}

.feature-info {
  flex: 1;
  min-width: 0;
}

.feature-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 2px;
}

.feature-name-en {
  font-size: 11px;
  color: var(--text-color);
  opacity: 0.6;
  font-family: 'Courier New', monospace;
}

.feature-impact {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  width: 180px;
}

.impact-bar-container {
  flex: 1;
  height: 8px;
  background: rgba(124, 58, 237, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.impact-bar {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed 0%, #9333ea 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
  box-shadow: 0 0 8px rgba(124, 58, 237, 0.4);
}

.impact-value {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color);
  font-family: 'Courier New', monospace;
  min-width: 60px;
  text-align: right;
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Prediction 折疊過渡動畫 */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 手機模式 RWD 優化 */
@media (max-width: 768px) {
  /* Prediction Card 整體調整 */
  .prediction-card {
    margin-top: 10px;
  }
  
  .prediction-header {
    padding: 10px 14px;
  }
  
  .prediction-title {
    font-size: 14px;
  }
  
  .prediction-body {
    padding: 12px;
  }
  
  /* 風險等級區域 - 改為垂直排列 */
  .risk-level-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .risk-badge {
    justify-content: center;
    padding: 12px 16px;
    font-size: 15px;
  }
  
  .risk-icon {
    font-size: 18px;
  }
  
  .probability-info {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    background: rgba(124, 58, 237, 0.05);
    border-radius: 8px;
  }
  
  .probability-label {
    font-size: 13px;
  }
  
  .probability-value {
    font-size: 20px;
  }
  
  /* SHAP 特徵項目 - 垂直堆疊優化 */
  .shap-features-list {
    gap: 10px;
  }
  
  .shap-feature-item {
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.6);
    align-items: stretch;
  }
  
  /* 排名與特徵名稱保持橫向 */
  .feature-header {
    gap: 10px;
  }
  
  .feature-rank {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .feature-info {
    flex: 1;
  }
  
  .feature-name {
    font-size: 13px;
    font-weight: 700;
  }
  
  .feature-name-en {
    font-size: 10px;
    opacity: 0.5;
  }
  
  /* 影響力區域 - 全寬顯示 */
  .feature-impact {
    width: 100%;
    gap: 10px;
  }
  
  .impact-bar-container {
    height: 10px;
  }
  
  .impact-value {
    font-size: 13px;
    min-width: 70px;
  }
}

/* 超小螢幕優化 (< 480px) */
@media (max-width: 480px) {
  .chat-bubble {
    max-width: 90%;
  }
  
  .prediction-header {
    padding: 8px 12px;
  }
  
  .prediction-title {
    font-size: 13px;
  }
  
  .prediction-body {
    padding: 10px;
  }
  
  .risk-badge {
    padding: 10px 14px;
    font-size: 14px;
  }
  
  .probability-value {
    font-size: 18px;
  }
  
  .shap-feature-item {
    padding: 10px;
  }
  
  .feature-name {
    font-size: 12px;
  }
  
  .feature-rank {
    width: 28px;
    height: 28px;
    font-size: 13px;
  }
  
  .impact-bar-container {
    height: 8px;
  }
  
  .impact-value {
    font-size: 12px;
    min-width: 60px;
  }
}

/* ========== 建議問題樣式 ========== */
.suggested-questions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  animation: fadeIn 0.4s ease;
}

.suggested-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 12px;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 6px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-btn {
  position: relative;
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: 12px;
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.question-btn::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
  opacity: 0;
  transition: opacity 0.25s ease;
}

.question-btn:hover {
  background: rgba(124, 58, 237, 0.08);
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.15);
  transform: translateX(2px);
}

.question-btn:hover::before {
  opacity: 1;
}

.question-btn:active {
  transform: translateX(2px) scale(0.98);
  box-shadow: 0 1px 4px rgba(124, 58, 237, 0.2);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 手機版建議問題優化 */
@media (max-width: 768px) {
  .suggested-questions {
    margin-top: 14px;
    padding-top: 14px;
  }
  
  .suggested-title {
    font-size: 12px;
    margin-bottom: 10px;
  }
  
  .questions-list {
    gap: 10px;
  }
  
  .question-btn {
    padding: 14px 16px;
    font-size: 14px;
    border-radius: 10px;
    /* 增加觸控區域 */
    min-height: 48px;
  }
  
  .question-btn:active {
    background: rgba(124, 58, 237, 0.12);
  }
}

@media (max-width: 480px) {
  .suggested-questions {
    margin-top: 12px;
    padding-top: 12px;
  }
  
  .suggested-title {
    font-size: 11px;
    margin-bottom: 8px;
  }
  
  .questions-list {
    gap: 8px;
  }
  
  .question-btn {
    padding: 12px 14px;
    font-size: 13px;
    line-height: 1.4;
  }
}
</style>
