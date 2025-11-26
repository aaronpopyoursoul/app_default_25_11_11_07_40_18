import type { CsrAnalyzeParams, CsrApiResponse } from '@/types/csr'

const DEFAULT_API_URL = 'https://wesleyhuang.pythonanywhere.com/WITSeeU'
const API_URL = import.meta.env.VITE_CSR_API_URL || DEFAULT_API_URL

export async function analyzeCsr(params: CsrAnalyzeParams): Promise<CsrApiResponse> {
  const { jdFile, resumeFile, aiModel, appVersion } = params
  const formData = new FormData()
  formData.append('jd_file', jdFile)
  formData.append('resume_file', resumeFile)
  formData.append('aiModel', aiModel)
  formData.append('appVersion', appVersion)

  let res: Response
  try {
    res = await fetch(API_URL, { method: 'POST', body: formData })
  } catch (e: any) {
    throw new Error(`網路或連線錯誤：${e?.message || e}`)
  }

  let data: CsrApiResponse
  try {
    data = await res.json()
  } catch (e: any) {
    throw new Error('回傳格式非 JSON 或解析失敗')
  }

  if (!res.ok) {
    throw new Error(data.message || `HTTP 狀態碼：${res.status}`)
  }
  if (data.status === 'error') {
    throw new Error(data.message || '後端回傳錯誤')
  }
  return data
}
