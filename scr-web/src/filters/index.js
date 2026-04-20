export function alarmColorFilter(value) {
  const map = {
    DANGER: '#F84540',
    WARNING: '#FF9900',
    NORMAL: '#19BE6B',
    INFO: '#2D8CF0'
  }
  return map[value]
}
export function alarmLevelFilter(value) {
  const map = {
    DANGER: '致命告警',
    WARNING: '严重告警',
    NORMAL: '一般告警',
    INFO: '告警提示'
  }
  return map[value]
}
export function healthFilter(value) {
  const map = {
    0: '健康',
    1: '严重告警',
    2: '重要告警',
    3: '次要告警',
    4: '提示告警'
  }
  return map[value]
}
