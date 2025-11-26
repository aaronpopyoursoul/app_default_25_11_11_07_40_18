import type {
  LoanInput,
  LoanPredictResponse,
  ChatRequest,
  ChatResponse,
  ShapSummaryResponse
} from '@/types/api'

const API_BASE_URL = 'https://wits-api-1092298396814.asia-east1.run.app'

/**
 * 貸款還款機率預測 API
 */
export async function predictLoan(
  loanData: LoanInput,
  bankId: string = 'DEFAULT'
): Promise<LoanPredictResponse> {
  const response = await fetch(`${API_BASE_URL}/predict/?bank_id=${bankId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(loanData)
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * AI 聊天對話 API (結合風險預測)
 */
export async function chatWithAI(request: ChatRequest): Promise<ChatResponse> {
  console.log('發送 Chat API 請求:', JSON.stringify(request, null, 2))
  
  const response = await fetch(`${API_BASE_URL}/chat/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Chat API 錯誤回應:', errorText)
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  console.log('Chat API 成功回應:', data)
  return data
}

/**
 * 獲取 SHAP 重要特徵分析
 */
export async function getShapSummary(topK: number = 10): Promise<ShapSummaryResponse[]> {
  const response = await fetch(`${API_BASE_URL}/shap/summary?top_k=${topK}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}
