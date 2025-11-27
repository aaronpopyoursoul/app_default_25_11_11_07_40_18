export type Option<T extends string = string> = { value: T; label: string }

export const TERM_OPTIONS: Option[] = [
  { value: '36 months', label: '36 個月' },
  { value: '60 months', label: '60 個月' },
]

export const GRADE_OPTIONS: Option[] = ['A','B','C','D','E','F','G'].map(g => ({ value: g, label: g }))

export const SUB_GRADE_OPTIONS: Option[] = (() => {
  const out: Option[] = []
  const grades = ['A','B','C','D','E','F','G']
  for (const g of grades) {
    for (let i = 1; i <= 5; i++) out.push({ value: `${g}${i}`, label: `${g}${i}` })
  }
  return out
})()

export const HOME_OWNERSHIP_OPTIONS: Option[] = [
  { value: 'RENT', label: '租賃' },
  { value: 'MORTGAGE', label: '抵押' },
  { value: 'OWN', label: '自有' },
]

export const VERIFICATION_STATUS_OPTIONS: Option[] = [
  { value: 'Not Verified', label: '未驗證' },
  { value: 'Source Verified', label: '來源已驗證' },
  { value: 'Verified', label: '已驗證' },
]

export const APPLICATION_TYPE_OPTIONS: Option[] = [
  { value: 'INDIVIDUAL', label: '個人申請' },
  { value: 'JOINT', label: '聯合申請' },
]

export const INITIAL_LIST_STATUS_OPTIONS: Option[] = [
  { value: 'w', label: '整筆放款 (whole)' },
  { value: 'f', label: '分割放款 (fractional)' },
]

// 依據樣本與常見 LendingClub 類別（來源頁面未明列完整清單，先提供已用到者）
export const PURPOSE_OPTIONS: Option[] = [
  { value: 'debt_consolidation', label: '債務整合' },
  { value: 'credit_card', label: '信用卡' },
  { value: 'major_purchase', label: '重大購置' },
]

export const buildSubGradeOptionsByGrade = (grade?: string): Option[] => {
  if (!grade) return SUB_GRADE_OPTIONS
  return SUB_GRADE_OPTIONS.filter(o => o.value.startsWith(grade))
}
