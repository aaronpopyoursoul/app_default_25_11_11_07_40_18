export type MessageType = 'user' | 'ai'

export interface ChatFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  raw?: File
}

export interface ChatContent {
  text: string
  files: ChatFile[]
  prediction?: {
    probability: number
    decision_label: string
    risk_level: string
    shap_top_features: Array<{
      feature_en: string
      feature_cn: string
      mean_abs_shap: number
    }>
  } | null
  meta?: {
    collapsible?: boolean
    truncatedPreview?: string
    isHtml?: boolean
    messageKind?: 'answer' | 'result' | 'usage-info' | 'error' | 'default'
    formSnapshotId?: string // 若此訊息攜帶表單快照供檢視
  }
}

export interface ChatMessage {
  id: string
  type: MessageType
  content: ChatContent
  timestamp: Date
}
