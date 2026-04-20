export function numberFilter(value, digit) {
  return value.toFixed(digit)
}

// 正反编译
export function booleanFilter(value) {
  const obj = {
    true: '是',
    false: '否',
    1: '是',
    0: '否',
    YES: '是',
    NO: '否'
  }
  return obj[value] || value
}

export function sexFilter(value) {
  const obj = {
    true: '男',
    false: '女'
  }
  return obj[value]
}

export function generalStatusFilter(value, type) {
  const cnUserData = {
    NORMAL: '正常',
    ABNORMAL: '已冻结',
    EXPIRED: '已过期',
    LOGOUT: '已注销'
  }
  const colorMap = {
    ABNORMAL: 'danger',
    NORMAL: 'success',
    EXPIRED: 'warning',
    LOGOUT: 'primary'
  }
  return type == 'color' ? colorMap[value] : cnUserData[value]
}
export function discountFilter(value) {
  if (!value) return '免费'
  const result = Number(value) * 10
  if (result === 10) return '无折扣'
  return result + '折'
}
export function status(value, type) {
  const levelData = {
    NORMAL: '正常',
    ALARM: '告警',
    ABNORMAL: '异常',
    DISABLED: '不可用'
  }
  const colorMap = {
    NORMAL: 'success',
    ALARM: 'warning',
    ABNORMAL: 'danger',
    DISABLED: 'disabled'
  }
  return type == 'color' ? colorMap[value] : levelData[value]
}

export function vendorName(vendor) {
  const dataMap = {
    HUAWEI: '华为云',
    TIANYI: '天翼云',
    VMWARE: 'vSphere',
    INSPURRAIL: '浪潮云',
    ALIYUN: '阿里云',
    H3C: '华三云',
    OPENSTACK: 'OpenStack',
    EASYSTACK: 'EasyStack',
    AZURE: 'Azure',
    TENCENT: '腾讯云',
    AWS: 'AWS',
    QCLOUD: '青云',
    HMC: 'HMC',
    SMARTX: 'SmartX',
    FUSIONSPHERE: 'FusionSphere',
    SANGFOR: '深信服',
    CLOUDTOWER: 'CloudTower',
    CNWARE: '云宏',
    CECSTACK: '电子云',
    MANAGEONE: '华为云'
  }
  return dataMap[vendor] || vendor
}
