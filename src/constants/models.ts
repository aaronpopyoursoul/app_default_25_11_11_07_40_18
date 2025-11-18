import { ChatDotRound, Lightning, Cpu } from '@element-plus/icons-vue'

export interface ModelOption {
  label: string
  value: string
  icon?: any
  description?: string
}

export const MODEL_OPTIONS: ModelOption[] = [
  { label: 'GPT-5 mini', value: 'GPT-5 mini', icon: ChatDotRound, description: '速度快且經濟實惠' },
  { label: 'GPT-5', value: 'GPT-5', icon: Lightning, description: '快速回應' },
  { label: 'GPT-4o', value: 'GPT-4o', icon: Cpu, description: '最強思考力' }
]
