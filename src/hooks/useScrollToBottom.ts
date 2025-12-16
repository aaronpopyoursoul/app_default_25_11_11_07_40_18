import { nextTick, type Ref } from 'vue'

/**
 * 智能滾動到新訊息
 * 提供類似 ChatGPT 的滾動體驗
 */
export function useScrollToBottom(containerRef: Ref<HTMLElement | null>) {
  // 檢查用戶是否正在閱讀舊訊息（不在底部附近）
  function isUserReadingHistory(): boolean {
    const el = containerRef.value
    if (!el) return false
    
    const threshold = 150 // 距離底部 150px 內視為在底部
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    
    return distanceFromBottom > threshold
  }

  // 平滑滾動到底部
  function scroll() {
    nextTick(() => {
      const el = containerRef.value
      if (!el) return
      
      // 如果用戶正在閱讀舊訊息，不自動滾動（避免打斷閱讀）
      if (isUserReadingHistory()) {
        return
      }
      
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      })
    })
  }

  // 滾動到新訊息的頂部（確保訊息開頭可見）
  function scrollToLatestMessage() {
    // 使用雙重 nextTick 確保 DOM 完全更新
    nextTick(() => {
      nextTick(() => {
        const el = containerRef.value
        if (!el) return
        
        // 如果用戶正在閱讀舊訊息，不自動滾動
        if (isUserReadingHistory()) {
          return
        }
        
        // 獲取最後一個訊息元素
        const messages = el.querySelectorAll('.chat-message')
        const lastMessage = messages[messages.length - 1]
        
        if (lastMessage) {
          // 使用 requestAnimationFrame 確保布局完成
          requestAnimationFrame(() => {
            // 滾動到訊息頂部，保留一些上方空間
            const messageTop = (lastMessage as HTMLElement).offsetTop
            const offset = 80 // 增加頂部留白，確保訊息頂部完全可見
            
            el.scrollTo({
              top: Math.max(0, messageTop - offset),
              behavior: 'smooth'
            })
          })
        } else {
          // 如果找不到訊息元素，fallback 到底部
          scroll()
        }
      })
    })
  }

  // 強制滾動（忽略用戶位置檢查）
  function forceScroll() {
    nextTick(() => {
      const el = containerRef.value
      if (!el) return
      
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      })
    })
  }

  // 強制滾動到最新訊息頂部（用於多段訊息的第一段）
  function forceScrollToLatestMessage() {
    // 使用雙重 nextTick 確保 DOM 完全更新和渲染
    nextTick(() => {
      nextTick(() => {
        const el = containerRef.value
        if (!el) return
        
        // 獲取最後一個訊息元素
        const messages = el.querySelectorAll('.chat-message')
        const lastMessage = messages[messages.length - 1]
        
        if (lastMessage) {
          // 使用 requestAnimationFrame 確保布局完成
          requestAnimationFrame(() => {
            // 滾動到訊息頂部，保留一些上方空間
            const messageTop = (lastMessage as HTMLElement).offsetTop
            const offset = 80 // 增加頂部留白，確保訊息頂部完全可見
            
            el.scrollTo({
              top: Math.max(0, messageTop - offset),
              behavior: 'smooth'
            })
          })
        } else {
          // 如果找不到訊息元素，fallback 到底部
          forceScroll()
        }
      })
    })
  }

  return { 
    scroll,                      // 智能滾動到底部
    scrollToLatestMessage,       // 智能滾動到最新訊息頂部
    forceScroll,                 // 強制滾動到底部（用於用戶發送訊息）
    forceScrollToLatestMessage   // 強制滾動到最新訊息頂部（用於多段訊息）
  }
}
