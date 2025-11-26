// API 類型定義
export interface LoanInput {
  loan_amnt: number
  int_rate: number
  installment: number
  sub_grade: string
  annual_inc: number
  dti: number
  open_acc: number
  pub_rec: number
  revol_bal: number
  revol_util: number
  total_acc: number
  mort_acc: number
  pub_rec_bankruptcies: number
  earliest_cr_line: string
  term: string
  grade: string
  emp_length: string
  home_ownership: string
  verification_status: string
  purpose: string
  application_type: string
}

export interface ShapTopFeature {
  feature_en: string
  feature_cn: string
  mean_abs_shap: number
}

export type DecisionLabel = 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface LoanPredictResponse {
  probability: number
  decision_label: DecisionLabel
  threshold: number
  risk_level: RiskLevel
  shap_top_features: ShapTopFeature[]
  policies: Record<string, any>
  meta: Record<string, any>
}

export interface ChatRequest {
  session_id: string
  message: string
  form_data?: LoanInput | null
  bank_id?: string
}

export interface ChatResponse {
  session_id: string
  reply: string
  model_used: string
  prediction?: LoanPredictResponse | null
  suggested_questions?: string[] | null
}

export interface ShapSummaryResponse {
  feature_en: string
  feature_cn: string
  mean_abs_shap: number
}
