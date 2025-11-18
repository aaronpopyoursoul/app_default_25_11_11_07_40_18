import { reactive } from 'vue'
import { generateId } from '@/utils/generateId'
import { useNotifier } from '@/hooks/useNotifier'
import type { ChatFile } from '@/types/chat'

/**
 * 檔案上傳與預覽處理（不涉及 input 觸發，只處理 change/移除/判斷）
 */
export function useFileUploads(options: { maxSizeMB?: number } = {}) {
  const { maxSizeMB = 10 } = options
  const files = reactive<ChatFile[]>([])
  const { notifyError } = useNotifier()

  const isImage = (file: File | ChatFile) => (file as File).type && (file as File).type.startsWith('image/')

  function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    const selectedFiles = input.files
    if (!selectedFiles || selectedFiles.length === 0) return

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]

      if (file.size > maxSizeMB * 1024 * 1024) {
        notifyError(`檔案 ${file.name} 超過 ${maxSizeMB}MB 限制。`)
        continue
      }

  if (files.find((f: ChatFile) => f.name === file.name && f.size === file.size)) continue

      const pushFile = (url = '') => {
        files.push({
          id: generateId('file'),
          name: file.name,
          size: file.size,
          type: file.type,
          url,
          raw: file
        })
      }

      if (isImage(file)) {
        const reader = new FileReader()
        reader.onload = (e) => pushFile(String((e.target as FileReader).result || ''))
        reader.readAsDataURL(file)
      } else {
        pushFile('')
      }
    }

    input.value = ''
  }

  function removeFile(id: string) {
  const idx = files.findIndex((f: ChatFile) => f.id === id)
    if (idx !== -1) files.splice(idx, 1)
  }

  return { files, onFileChange, removeFile, isImage }
}
