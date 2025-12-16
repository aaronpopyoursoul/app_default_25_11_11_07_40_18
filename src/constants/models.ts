import { ChatDotRound, Lightning, Cpu } from '@element-plus/icons-vue'

export interface ModelOption {
  label: string
  value: string
  icon?: any
  description?: string
}

export const MODEL_OPTIONS: ModelOption[] = [
  { label: 'gpt-4o-mini', value: 'gpt-4o-mini', icon: Cpu, description: '高性價比推理能力' },
  //{ label: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo', icon: ChatDotRound, description: '經濟快速回應' }
]
