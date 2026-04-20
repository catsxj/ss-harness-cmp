export function numberFilter(value: number, digit: number): string {
  return value.toFixed(digit)
}

export function paymentModeFilter(val: string): string {
  const obj: Record<string, string> = {
    Hour: '按量付费',
    Month: '包年包月'
  }
  return obj[val] || ''
}

export function booleanFilter(value: unknown): string {
  const obj: Record<string, string> = {
    true: '是',
    false: '否',
    1: '是',
    0: '否',
    YES: '是',
    NO: '否',
    null: '否'
  }
  return obj[String(value)] || String(value ?? '')
}

export function sexFilter(value: unknown): string {
  const obj: Record<string, string> = {
    true: '男',
    false: '女'
  }
  return obj[String(value)] || ''
}

export function generalStatusFilter(value: string, type?: 'color'): string {
  const cnUserData: Record<string, string> = {
    NORMAL: '正常',
    ABNORMAL: '已冻结',
    EXPIRED: '已过期',
    LOGOUT: '已注销'
  }
  const colorMap: Record<string, string> = {
    ABNORMAL: 'danger',
    NORMAL: 'success',
    EXPIRED: 'warning',
    LOGOUT: 'primary'
  }
  return type === 'color' ? colorMap[value] || '' : cnUserData[value] || ''
}
