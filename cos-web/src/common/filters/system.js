export function chargeMode(value, type) {
  const levelData = {
    PreCharge: '预付费',
    PostCharge: '后付费'
  }
  return levelData[value]
}

// 账单状态
export function billStatusFilter(value) {
  const obj = {
    unpay: '未支付',
    paid: '已支付',
    paying: '支付中',
    canceld: '已取消'
  }
  return obj[value]
}
