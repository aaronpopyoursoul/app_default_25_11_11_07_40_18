import { nextTick, type Ref } from 'vue'

// 封裝訊息容器自動捲到底部的邏輯
// containerRef: a ref to a scrollable element
export function useScrollToBottom(containerRef: Ref<HTMLElement | null>) {
  function scroll() {
    nextTick(() => {
      const el = containerRef.value
      if (el) el.scrollTop = el.scrollHeight
    })
  }
  return { scroll }
}
