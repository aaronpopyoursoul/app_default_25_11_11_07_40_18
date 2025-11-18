import { ElMessage } from 'element-plus'

export function useNotifier() {
  const notifyError = (msg: string) => ElMessage.error(msg)
  const notifySuccess = (msg: string) => ElMessage.success(msg)
  const notifyWarning = (msg: string) => ElMessage.warning(msg)
  return { notifyError, notifySuccess, notifyWarning }
}
