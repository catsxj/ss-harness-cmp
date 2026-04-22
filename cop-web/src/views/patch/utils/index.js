import { getUser } from 'services/system/user'
import { getTaskTemplates } from 'services/task/patch'
// 获取用户列表
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

// 获取补丁分类
export const typeList = [
  // {
  //   code: 'WIN',
  //   name: 'windows'
  // },
  {
    code: 'LINUX',
    name: 'linux'
  },
  {
    code: 'DBO',
    name: '单机'
  },
  {
    code: 'DBM',
    name: '集群'
  },
  {
    code: 'TOMCAT',
    name: 'tomcat'
  },
  {
    code: 'WEBLOGIC',
    name: 'weblogic'
  }
]

export const headerList = [
  {
    code: 'name',
    name: '任务名称'
  },
  {
    code: 'type',
    name: '任务类型'
  },
  {
    code: 'creator',
    name: '执行人员'
  },
  {
    code: 'gmtCreate',
    name: '完成时间'
  }
]

export function getInspectTypeName (code) {
  for (const item of typeList) {
    if (item.code === code) {
      return item.name
    }
  }
}

// 获取补丁模板
export function getTempList (self) {
  return getTaskTemplates()
}

export const paramType = [
  {
    code: 'String',
    name: '字符串'
  },
  {
    code: 'password',
    name: '密码'
  },
  {
    code: 'txt',
    name: '富文本'
  }
]
