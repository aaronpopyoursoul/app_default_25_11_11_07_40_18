import { ref } from 'vue'

export function useModelSelection(initial = 'gpt-4o-mini', onChange?: (val: string) => void) {
  const selectedModel = ref<string>(initial)
  function setModel(val: string) {
    selectedModel.value = val
    if (typeof onChange === 'function') onChange(val)
  }
  return { selectedModel, setModel }
}
