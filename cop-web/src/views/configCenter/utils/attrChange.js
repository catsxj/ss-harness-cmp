export function translateAttr (data, localData, serverData) {
  data.forEach(item => {
    localData[item.local] = serverData[item.server]
  })
  return localData
}

export function propertyAddName (data, propertyList) {
  const _propertyList = JSON.parse(JSON.stringify(propertyList))
  const result = [], _data = data || []
  for (const key of Object.keys(_data)) {
    for (const property of _propertyList) {
      if (key === property.code) {
        const _item = property
        if (_item.type === 'RADIO' || _item.type === 'SELECT') {
          // 单选处理
          property.item.forEach(k => {
            if (_data[key] === k.value) {
              _item.detailValue = k.name
              _item.propertyValue = k.value
            }
          })
          result.push(_item)
        } else if (_item.type === 'CHECKBOX') {
          // 多选处理
          _item.detailValue = ''
          _item.propertyValue = _data[key]
          const _dataArr = _data[key] && _data[key].split(',')
          if (_dataArr) {
            property.item.forEach(k => {
              if (_dataArr.includes(k.value)) {
                _item.detailValue += k.name + ' '
              }
            })
          }
          result.push(_item)
        } else if (_item.type === 'TABLE') {
          _item.propertyValue = _data[key]
          _item.grid = JSON.parse(property.propertyValue)
          result.push(_item)
        } else {
          _item.propertyValue = _data[key]
          result.push(_item)
        }
      }
    }
  }
  result.sort((a, b) => {
    return a.orderNum - b.orderNum
  });

  return result
}

/**
 * 比较数据
 * @param {*} bf 变更前
 * @param {*} af 变更后
 */
const checkRowData = (befD, aftD) => {
  const keys = Object.keys(aftD)
  keys.forEach(key => {
    befD[key] = {
      className: 'defaultColor',
      value: befD[key] || ''
    }
    if (befD[key].value === aftD[key]) {
      aftD[key] = {
        className: 'defaultColor',
        value: aftD[key] || ''
      }
    } else {
      aftD[key] = {
        className: 'hightColor',
        value: aftD[key] || ''
      }
    }
  })
}

const handleRow_a = (row) => {
  const keys = Object.keys(row)
  keys.forEach(key => {
    row[key] = {
      className: 'hightColor',
      value: row[key] || ''
    }
  })
}
const handleRow_b = (row) => {
  const keys = Object.keys(row)
  keys.forEach(key => {
    row[key] = {
      className: 'defaultColor',
      value: row[key] || ''
    }
  })
}

export function addChangeFlag (beforeData, afterData) {
  let hasTable = false
  const tableData = {}
  const tablePropList = {}
  const tableName = {}
  afterData.forEach((afItem, index) => {
    let isHas = false
    let afR = []
    if (afItem.type === 'TABLE') {
      if (!hasTable) {
        hasTable = true
      }
      tableName[afItem.code] = afItem.name
      tablePropList[afItem.code] = afItem.item
      afR = JSON.parse(afItem.propertyValue)
    }
    for (const beItem of beforeData) {
      if (afItem?.code === beItem?.code) {
        isHas = true
        if (afItem?.propertyValue !== beItem?.propertyValue) {
          afItem.isHight = true
        }
        if (beItem.type === 'TABLE') {
          const bfR = JSON.parse(beItem.propertyValue) || []
          tableData[afItem.code] = {}
          tableData[afItem.code].beforeData = bfR
          tableData[afItem.code].afterData = afR
        }
      }
    }
    if (!isHas) {
      afItem.isHight = true
    }
  })
  Object.keys(tableData).forEach(key => {
    // 遍历表格
    const tabD = tableData[key]
    const len = tabD.afterData.length > tabD.beforeData.length ? tabD.afterData.length : tabD.beforeData.length
    for (let i = 0; i < len; i++) {
      if (tabD.beforeData[i] && tabD.afterData[i]) {
        checkRowData(tabD.beforeData[i], tabD.afterData[i])
      } else if (!tabD.beforeData[i] && tabD.afterData[i]) {
        handleRow_a(tabD.afterData[i])
      } else if (tabD.beforeData[i] && !tabD.afterData[i]) {
        handleRow_b(tabD.beforeData[i])
      }
    }
  })
  return {
    result: afterData,
    tableData,
    tableName,
    tablePropList,
    hasTable
  }
}

export function syntaxHighlight (json) {
  if (typeof json != 'string') {
    json = JSON.stringify(json, undefined, 2);
  }
  json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\\-]?\d+)?)/g, function (match) {
    var cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

// 数据添加属性name
export function handleDataAddAttr (data, attrList) {
  const handleList = ['SELECT', 'RADIO', 'CHECKBOX']
  data && data.forEach(dataItem => {
    Object.keys(dataItem).forEach(key => {
      let checkItem = ''
      for (const attr of attrList) {
        if (key === attr.code && handleList.includes(attr.type)) {
          if (attr.type === 'CHECKBOX') {
            if (dataItem[key] && !dataItem[key].includes(',')) {
              attr.item && attr.item.forEach(item => {
                if (item.value === dataItem[key]) {
                  dataItem[key] = item.name
                }
              })
            } else if (dataItem[key] && dataItem[key].includes(',')) {
              const valList = dataItem[key].split(',')
              attr.item && attr.item.forEach(item => {
                if (valList.includes(item.value)) {
                  checkItem += ` ${item.name}`
                  dataItem[key] = checkItem
                }
              })
            }
          } else {
            attr.item && attr.item.forEach(item => {
              if (item.value === dataItem[key]) {
                dataItem[key] = item.name
              }
            })
          }
        }
      }
    })
  })
  return data
}
