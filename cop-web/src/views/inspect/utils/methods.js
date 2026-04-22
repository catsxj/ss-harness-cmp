/**
 * // 获取按钮权限
 * // hasRemote, hasAgent, hasJump, hasCmdb, hasNetwork, hasSafety
 * @param {String} type 类型
 */
import { getSystems, getInspectItem, getTemplates, getTemplatesDetail } from 'services/task/inspect'
export function getTabAuthor(type) {
  let showTabList = []
  switch (type) {
    case 'APPLICATION': // 应用巡检
      showTabList = ['hasRemote', 'hasAgent', 'hasJump', 'hasCmdb', 'hasNetwork', 'hasSafety']
      break;
    case 'HOST': // 主机巡检
      showTabList = ['hasRemote', 'hasAgent', 'hasCmdb']
      break;
    case 'DB': // 数据库巡检
      showTabList = ['hasRemote', 'hasAgent', 'hasCmdb']
      break;
    case 'MIDDLEWARE': // 中间件巡检
      showTabList = ['hasRemote', 'hasAgent', 'hasCmdb']
      break;
    case 'NETWORK': // 网络巡检
      showTabList = ['hasRemote', 'hasJump', 'hasCmdb', 'hasNetwork', 'hasSafety', 'hasAgent']
      break;
    case 'OTHERS':
      showTabList = ['hasRemote', 'hasAgent', 'hasJump', 'hasCmdb', 'hasNetwork', 'hasSafety']
      break;
  }

  return showTabList
}

/**
 * // 获取应用系统
 * @param {*} slef
 */
export function getSystemList(self) {
  return new Promise((resolve, reject) => {
    const params = {
      page: 1,
      rows: 9999,
      sorter: JSON.stringify({ gmtCreate: '1' })
    }
    params.params = JSON.stringify([{
      moduleCode: 'application_system',
      conditions: []
    }])
    getSystems(params).then(data => {
      if (data.success) {
        resolve(data.data.rows)
      }
    }).catch(error => {
      reject(error)
    })
  })
}

/**
 * // 根据指标获取巡检项
 */
export function getInspectItemByType(self, index, data) {
  return new Promise((resolve, reject) => {
    if (!data) {
      self.changeInspectItemType(index)
      return
    }
    const params = {
      page: 1,
      rows: 999
    }
    // 根据分类切换数据
    params.params = JSON.stringify([
      {
        param: {
          targetType: data
        },
        sign: 'EQ'
      }
    ])
    getInspectItem(params).then(data => {
      if (data.success) {
        resolve(data.data.rows)
      }
    }).catch(error => {
      reject(error)
    })
  })
}

// 获取巡检模板
export function getTempList(self) {
  return new Promise((resolve, reject) => {
    const params = {
      page: 1,
      rows: 999
    }
    getTemplates(params).then(data => {
      if (data.success) {
        resolve(data.data.rows)
      }
    }).catch(error => {
      reject(error)
    })
  })
}

export function getTempDetail(self, index, id) {
  return new Promise((resolve, reject) => {
    if (!id) {
      self.clearInspectItemIds(index)
      return;
    }
    getTemplatesDetail(id).then(data => {
      if (data.success) {
        const ids = []
        data.data.forEach(item => {
          self.$nextTick(() => {
            ids.push(item.id)
          })
        })
        resolve(ids)
      }
    }).catch(error => {
      reject(error)
    })
  })
}

/**
 * // 数据校验
 * @param {*} self
 * @param {*} item 数据源
 */
export function testGroupData(self, item) {
  if (!item.name) {
    self.$message.error(`资源组名称不能为空【${item.name}】`)
    return false
  }
  // if (item.name.match(/^\s+|\s+$/g)) {
  //   this.$message.error(`资源组名称首尾不能包含空格【${item.name}】`)
  //   return false
  // }
  if (!item.hostList.length) {
    self.$message.error(`资源组服务器列表不能为空【${item.name}】`)
    return false
  }
  if (!item.itemIds.length) {
    self.$message.error(`资源组巡检项不能为空【${item.name}】`)
    return false
  }
  return true
}
