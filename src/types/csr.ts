export interface CsrApiSuccessInfo {
  appVersion?: string
  aiModel?: string
  jd_file?: string
  resume_file?: string
}

export interface CsrApiUsage {
  input_tokens?: number
  output_tokens?: number
  total_cost?: number
}

export interface CsrApiResponse {
  status: 'success' | 'error'
  message?: string
  answer?: string
  result?: any
  usage?: CsrApiUsage
  info?: CsrApiSuccessInfo
}

export interface CsrAnalyzeParams {
  jdFile: File
  resumeFile: File
  aiModel: string
  appVersion: string
}
