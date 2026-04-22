/* eslint-disable prefer-const */
/**
 * 获取属性字段
 * @param {*} self 组件实例this
 * @param {number} id 配置项id
 * @return 包含所有属性的对象
 */
import { getModuls } from 'services/task/cmdb'
export function getProperty (self, id) {
  // eslint-disable-next-line prefer-const
  let params = {}, hostAttrs = {}, hostAttrsList = [], properTyGroups = [],
    allProperties = [];
  const that = self
  params.id = id

  return new Promise((resolve, reject) => {
    that.$http({
      method: 'get',
      url: '/cmdb/bsm/module/property',
      data: params
    }).then(data => {
      if (data.success) {
        properTyGroups = data.data.groups
        allProperties = data.data.properties
        for (const item of allProperties) {
          let { code, name, isRequired, type, isGrid, isUnique } = item
          if (code !== 'id') {
            hostAttrsList.push({ code, name, isRequired, type, isGrid, isUnique })
            that.checkData && that.$set(that.checkData, code, isGrid)
          }
        }
        resolve({ hostAttrs, hostAttrsList, properTyGroups, allProperties })
      }
    }).catch(error => {
      reject(error)
    })
  })
}

/**
 * 获取所有属性字段
 * @param {*} self 穿入组件实例this
 * @param { number } id 配置项id
 * @return 包含所有属性的对象
 */
export function getPropertyAll (self, id) {
  let params = {}, allProperties = [], that = self
  params.id = id
  return new Promise((resolve, reject) => {
    that.$http({
      method: 'get',
      url: '/cmdb/bsm/module/propertyAll',
      data: params
    }).then(data => {
      if (data.success) {
        allProperties = data.data.properties
        resolve({ allProperties })
      }
    }).catch(error => {
      reject(error)
    })
  })
}

/**
 * 获取属性字段 通过code
 * @param {string} moduleCode 配置项code
 * @return 包含所有属性的对象
 */
export function getPropertyByCode (Vue, moduleCode) {
  let hostAttrs = {},
    properties = [],
    hostAttrsList = [],
    properTyGroups = []

  return new Promise((resolve, reject) => {
    getModuls({ moduleCode: moduleCode }).then(data => {
      if (data.success) {
        properTyGroups = data.data.groups
        properties = data.data.properties
        for (let property of properties) {
          let decimalNum = 0
          let { code, name, isRequired, type, isGrid, item, isUnique } = property
          if (property.decimalNum) {
            decimalNum = property.decimalNum
          }
          hostAttrs[property.code] = property.defaultValue || ''
          if (code !== 'id') {
            hostAttrsList.push({ code, name, isRequired, type, isGrid, item, decimalNum, isUnique })
          }
        }
        resolve({
          hostAttrs,
          properties,
          hostAttrsList,
          properTyGroups
        })
      }
    }).catch(error => {
      reject(error)
    })
  })
}

/**
 * 获取实例详情
 * @param {string} moduleCode 模型code
 * @param {string} instanceId 实例id
 */
export function getInstanceDetail (Vue, moduleCode, instanceId, allProperties) {
  let params = {
    moduleCode: moduleCode,
    id: instanceId
  }
  return new Promise((resolve, reject) => {
    Vue.$http({
      method: 'get',
      url: '/cmdb/bsm/resource/detail',
      data: { isApp: true, params: JSON.stringify(params) },
      options: {
        noParam: true
      }
    }).then(data => {
      if (data.success) {
        let _data = data.data, result = []
        for (let key of Object.keys(_data)) {
          for (let property of allProperties) {
            if (key === property.code) {
              let _item = property
              _item.propertyValue = _data[key]
              result.push(_item)
            }
          }
        }
        // 字段位置排序
        result.sort((a, b) => {
          return a.orderNum - b.orderNum
        });
        resolve(result)
      }
    }).catch(error => {
      reject(error)
    })
  })
}

/**
 * 按时间排序
 * @param {*} data 待处理数据
 */
export function sortDataByTime (data) {
  data && data.sort((s1, s2) => {
    return new Date(s2.gmt_create) - new Date(s1.gmt_create)
  })
  return data
}

/**
 * 查询时处理查询参数
 * @param { string } searchData 搜索内容
 * @param { string } attrList 字段列表
 * @param { string } sign 搜索类型  LK / EQ
 */
export function searchParam (searchData, attrList, sign) {
  let result = []
  for (let item of attrList) {
    if (searchData[item] !== null && searchData[item] !== undefined && searchData[item] !== '') {
      if (sign === 'GET') {
        result.push({ param: { [item]: searchData[item][0] }, sign: sign })
      } else if (sign === 'LET') {
        result.push({ param: { [item]: searchData[item][1] }, sign: sign })
      } else {
        result.push({ param: { [item]: Array.isArray(searchData[item]) ? parseInt(searchData[item][searchData[item].length - 1]) : searchData[item] }, sign: sign })
      }
    }
  }

  return result
}

/**
 * 获取配置项
 * @param {*} self
 */
export function getModuleList_byRequest (self) {
  return new Promise((resolve) => {
    self.$http({
      method: 'post',
      url: '/cmdb/bsm/module/listAll'
    }).then(res => {
      if (res.success) {
        self.moduleMap = res.data
        resolve(res.data)
      }
    })
  })
}
