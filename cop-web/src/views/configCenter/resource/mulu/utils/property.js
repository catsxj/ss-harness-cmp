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
