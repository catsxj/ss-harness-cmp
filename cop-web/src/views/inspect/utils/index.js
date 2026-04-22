// 获取用户列表
import { getUser } from 'services/system/user'
import { getTemplate } from 'services/task/task'
import { getTemplatesDetail } from 'services/task/inspect'
export function getUserList (self) {
  const _data = {
    page: 1,
    rows: 9999
  }
  _data.params = JSON.stringify([{
    param: {
      tenantId: 0
    },
    sign: 'EQ'
  }])
  return getUser(_data)
  // return new Promise((resolve) => {
  //   getUser(_data).then(res => {
  //     if (res.success) {
  //       resolve(res.data.rows)
  //     }
  //   })
  // })
}

// 获取巡检分类
export const inspectTypeList = [
  {
    code: 'APPLICATION',
    name: '应用巡检'
  },
  {
    code: 'HOST',
    name: '主机巡检'
  },
  {
    code: 'DB',
    name: '数据库巡检'
  },
  {
    code: 'MIDDLEWARE',
    name: '中间件巡检'
  },
  {
    code: 'NETWORK',
    name: '网络巡检'
  },
  {
    code: 'OTHERS',
    name: '其他巡检'
  }
]

// 根据code获取巡检分类名称
export function getInspectTypeName (code) {
  for (const item of inspectTypeList) {
    if (item.code === code) {
      return item.name
    }
  }
}

// 获取模板列表
function getTemplateList (self, scenceId) {
  const _scenceId = scenceId
  return new Promise((resolve) => {
    getTemplate({
      simple: true,
      page: 1,
      rows: 9999,
      params: JSON.stringify([{ param: { sceneId: _scenceId, internal: false }, sign: 'EQ' }])
    }).then(res => {
      if (res.success) {
        resolve(res.data.rows)
      }
    })
  })
}

export function getNormTypeList () {
  return []
}

function getWeekItem (val) {
  switch (val) {
    case 1:
      return { name: '周一', value: 1 }
    case 2:
      return { name: '周二', value: 2 }
    case 3:
      return { name: '周三', value: 3 }
    case 4:
      return { name: '周四', value: 4 }
    case 5:
      return { name: '周五', value: 5 }
    case 6:
      return { name: '周六', value: 6 }
    case 7:
      return { name: '周日', value: 7 }
  }
}
/**
 * // 获取周数据
 * @param {*} start 起始日
 * @param {*} end 终止日
 */
export function getWeekOptions (start, end) {
  const result = []
  for (let i = start; i <= end; i++) {
    result.push(getWeekItem(i))
  }
  return result
}

/**
 * // 获取月数据
 * @param {*} start 起始日
 * @param {*} end 终止日
 */
export function getMonthOptions (start, end) {
  const result = []
  for (let i = start; i <= end; i++) {
    result.push({ name: `${i}号`, value: i })
  }
  return result
}

/**
 * 计算某年某月有多少天
 * @param  {[number]} year 某年
 * @param  {[number]} month 某月
 * @return {[number]}      某年某月有多少天
 */
export function getDaysInYearMonth (year, month) {
  let _year = year, _month = month
  _month = parseInt(_month, 10) + 1;
  if (_month > 12) {
    _year += 1
    _month = 1
  }
  const date = new Date(_year, _month, 0);
  return date.getDate();
}
// 指标分类包含全部
export const normListAll = [
  {
    id: 0,
    code: 'all',
    name: '全部分类'
  },
  {
    id: 1,
    code: 'host',
    name: '主机'
  },
  {
    id: 2,
    code: 'db',
    name: '数据库'
  },
  {
    id: 3,
    code: 'middle',
    name: '中间件'
  },
  {
    id: 4,
    code: 'net',
    name: '网络'
  },
  {
    id: 5,
    code: 'other',
    name: '其他'
  }
]

// 指标分类
export const normList = [
  {
    id: 1,
    code: 'host',
    name: '主机'
  },
  {
    id: 2,
    code: 'db',
    name: '数据库'
  },
  {
    id: 3,
    code: 'middle',
    name: '中间件'
  },
  {
    id: 4,
    code: 'net',
    name: '网络'
  },
  {
    id: 5,
    code: 'other',
    name: '其他'
  }
]

// 告警规则
export const ruleList = [
  {
    id: 0,
    name: '>',
    code: 'GT'
  },
  {
    id: 1,
    name: '=',
    code: 'EQ'
  },
  {
    id: 2,
    name: '<',
    code: 'LT'
  },
  {
    id: 3,
    name: '>=',
    code: 'GE'
  },
  {
    id: 4,
    name: '<=',
    code: 'LE'
  },
  {
    id: 5,
    name: '不等于',
    code: 'NEQ'
  },
  {
    id: 6,
    name: '包含',
    code: 'IN'
  },
  {
    id: 7,
    name: '不包含',
    code: 'NIN'
  }
]

// 告警级别
export const levelList = [
  {
    id: 1,
    code: 'danger',
    name: '严重'
  },
  {
    id: 2,
    code: 'warning',
    name: '警告'
  },
  {
    id: 3,
    code: 'light',
    name: '轻微'
  }
]

export const typeList = [
  { name: '自定义报表', value: 'custom' },
  { name: '报表模板', value: 'template' }
]

export function getTempDetail (self, id) {
  return new Promise((resolve, reject) => {
    getTemplatesDetail(id).then(data => {
      if (data.success) {
        resolve(data.data)
      }
    }).catch(error => {
      reject(error)
    })
  })
}

export const allList = [
  {
    id: 1,
    name: 'name',
    remark: '巡检名称'
  },
  {
    id: 2,
    name: 'category',
    remark: '巡检分类'
  },
  {
    id: 3,
    name: 'userName',
    remark: '执行人员'
  },
  {
    id: 4,
    name: 'status',
    remark: '巡检状态'
  },
  {
    id: 5,
    name: 'warning',
    remark: '巡检结果'
  }
]

export const preSelectList = [
  {
    id: 1,
    name: 'name',
    remark: '巡检名称'
  },
  {
    id: 2,
    name: 'category',
    remark: '巡检分类'
  },
  {
    id: 3,
    name: 'userName',
    remark: '执行人员'
  }
]

export const paramListAll = [
  {
    id: 1,
    code: 'ip',
    name: '主机IP'
  },
  {
    id: 2,
    code: 'itemName',
    name: '指标项'
  },
  {
    id: 3,
    code: 'inspectResult',
    name: '指标值'
  },
  {
    id: 4,
    code: 'rule',
    name: '规则'
  },
  {
    id: 5,
    code: 'threshold',
    name: '阈值'
  },
  {
    id: 6,
    code: 'warning',
    name: '告警等级'
  }
]

export const cycle = [
  {
    code: 'Day',
    name: '日报'
  },
  {
    code: 'Week',
    name: '周报'
  },
  {
    code: 'Month',
    name: '月报'
  }
]

export const status = [
  {
    code: 'Off',
    name: '禁用'
  },
  {
    code: 'On',
    name: '启用'
  }
]
