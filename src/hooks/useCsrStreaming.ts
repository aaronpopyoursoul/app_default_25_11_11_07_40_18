import type { Ref } from 'vue'
import type { ChatMessage } from '@/types/chat'

/**
 * CSR 分析模擬串流：維持原行為（文字分段、600ms 間隔、完成後關閉 loading）
 */
export function useCsrStreaming({ messages, analyzing, scroll }: { messages: Ref<ChatMessage[]>; analyzing: Ref<boolean>; scroll: () => void }) {
  function buildUserStartMessage(model: string, version: string, jdFile?: File | null, resumeFile?: File | null): ChatMessage {
    return {
      id: Date.now() + '-user',
      type: 'user',
      content: {
        text: `開始分析\n模型：${model}｜版本：${version}\nJD：${jdFile?.name}\nResume：${resumeFile?.name}`,
        files: []
      },
      timestamp: new Date()
    }
  }

  function createAiMessage(): ChatMessage {
    return {
      id: Date.now() + '-ai',
      type: 'ai',
      content: { text: '', files: [] },
      timestamp: new Date()
    }
  }

  function startAnalyze({ model, version, jdFile, resumeFile }: { model: string; version: string; jdFile?: File | null; resumeFile?: File | null }) {
    if (!jdFile || !resumeFile) return
    analyzing.value = true

    messages.value.push(buildUserStartMessage(model, version, jdFile, resumeFile))

    const aiMsg = createAiMessage()
    messages.value.push(aiMsg)
    scroll()

    const chunks = [
      '已讀取 JD 與履歷，開始比對關鍵字與技能…',
      '完成語義比對，建立能力矩陣與相似度向量…',
      '初步結果：匹配度 78%，主要優勢：Python、資料處理；需補強：雲端部署、系統設計。',
      '建議：針對雲端（GCP/AWS）完成至少一個實作案例，並補充高階系統設計圖。'
    ]

    let i = 0
    const timer = setInterval(() => {
      if (i >= chunks.length) {
        clearInterval(timer)
        analyzing.value = false
        return
      }
      aiMsg.content.text += (aiMsg.content.text ? '\n' : '') + chunks[i]
      i++
      scroll()
    }, 600)
  }

  return { startAnalyze }
}
