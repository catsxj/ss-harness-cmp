const alarmColorMap: Record<string, string> = {
  DANGER: '#F84540',
  WARNING: '#FF9900',
  NORMAL: '#19BE6B',
  INFO: '#2D8CF0'
}

const alarmLevelMap: Record<string, string> = {
  DANGER: '致命告警',
  WARNING: '严重告警',
  NORMAL: '一般告警',
  INFO: '告警提示'
}

const healthMap: Record<number, string> = {
  0: '健康',
  1: '严重告警',
  2: '重要告警',
  3: '次要告警',
  4: '提示告警'
}

export function alarmColorFilter(value: string): string {
  return alarmColorMap[value] || ''
}

export function alarmLevelFilter(value: string): string {
  return alarmLevelMap[value] || ''
}

export function healthFilter(value: number): string {
  return healthMap[value] || ''
}
