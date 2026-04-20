import { conditionBill, getOrderDashboard, getAlarmCount, getOrderCount, getTodoCount } from 'services/system/portal'

async function getPayWayCount() {
  const res = await getOrderDashboard({
    time: 'Months'
  })
  return res.data.typeOrders
}

async function getTodayAlarmCount() {
  const res = await getAlarmCount({
    action: 'pieChart',
    time: 'TODAY'
  })
  return res.data
}

async function getOrders() {
  const res = await getOrderCount()
  return res.data
}

export async function getCardData(item: any) {
  switch (item.config.code) {
    case 'ToDoWork':
      {
        const res = await getTodoCount()
        if (res.success) {
          item.data = res.data
        }
      }
      break
    case 'OrderCount':
      item.data = await getOrders()
      break
    case 'MoneyCount':
      const res = await conditionBill({
        condition: 'totalBills'
      })
      if (res.success) {
        item.data = [
          {
            name: '租户消费总计',
            value: res.data
          }
        ]
      }
      break
    case 'tenantTop5':
    case 'userTop5':
      {
        const res = await conditionBill({
          condition: item.config.code
        })
        if (res.success) {
          item.data = res.data
        }
      }
      break
    case 'PayWayCount':
      item.data = await getPayWayCount()
      break
    case 'TodayAlarmCount':
      item.data = await getTodayAlarmCount()
      break
  }
}
