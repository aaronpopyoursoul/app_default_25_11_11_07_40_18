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
}

export interface ChatMessage {
  id: string
  type: MessageType
  content: ChatContent
  timestamp: Date
}
