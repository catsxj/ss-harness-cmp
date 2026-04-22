import { getTemplateDetail } from 'services/task/compliance'
import { getUser } from 'services/system/user'
// 获取用户列表
export function getUserList(self) {
  const _data = {
    page: 1,
    rows: 9999
  }
  _data.params = JSON.stringify([
    {
      param: {
        tenantId: 0
      },
      sign: 'EQ'
    }
  ])
  return getUser(_data)
}

// 获取合规分类
export const complianceTypeList = [
  {
    code: 'HOST',
    name: '主机合规'
  },
  {
    code: 'DB',
    name: '数据库合规'
  },
  {
    code: 'MIDDLEWARE',
    name: '中间件合规'
  },
  {
    code: 'NETWORK',
    name: '网络合规'
  },
  {
    code: 'OTHERS',
    name: '其他合规'
  }
]

// 任务类别
export const taskType = [
  {
    code: 0,
    name: '常规任务'
  },
  {
    code: 1,
    name: '定时任务'
  }
]

// 通过code匹配name
export function getInspectTypeName(code) {
  for (const item of complianceTypeList) {
    if (item.code === code) {
      return item.name
    }
  }
}
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

// 基线分类
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

export function getComplianceTempDetail(self, id) {
  return new Promise((resolve, reject) => {
    getTemplateDetail(id)
      .then((data) => {
        if (data.success) {
          resolve(data.data)
        }
      })
      .catch((error) => {
        reject(error)
      })
  })
}

// 合规状态
export const passList = [
  {
    id: 1,
    code: true,
    name: '合规'
  },
  {
    id: 2,
    code: false,
    name: '不合规'
  }
]

// 历史记录头部展示字段
export const headerList = [
  {
    code: 'name',
    name: '合规名称'
  },
  {
    code: 'category',
    name: '合规分类'
  },
  {
    code: 'userName',
    name: '执行人员'
  },
  {
    code: 'gmtCreate',
    name: '检查时间'
  }
]

// 状态列表
export const statusList = [
  {
    code: 'STARTING',
    name: '启动中'
  },
  {
    code: 'RUNNING',
    name: '执行中'
  },
  {
    code: 'SUCCESS',
    name: '成功'
  },
  {
    code: 'ERROR',
    name: '错误'
  }
]
