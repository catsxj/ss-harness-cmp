/**
 * Created by Zhang Haijun on 2017/11/21.
 */
// 对目标机器处理
export function judgeServer(data, mode) {
  let keyIndex = 0
  if (
    !data.every((item, key) => {
      keyIndex = key
      if (mode === 'SINGLE') {
        return item.host && item.port && item.user && item.pasd
      } else {
        return item.host && item.port
      }
    })
  ) {
    return `目标机器第${keyIndex + 1}条信息填写不完整，请检查`
  }
  return ''
}

export function formatServerList(itemData) {
  itemData.target.forEach((data) => {
    delete data.privateIps
    delete data.isLoaded
  })
}

// 判断当前页面显示组件
export function judgeIfEdit(instance) {
  if (instance.$route.name.indexOf('Tpl') > -1) instance.hideServer = true
  if (instance.$route.name.indexOf('Cron') > -1) instance.hideSuspend = true
  if (instance.$route.name.indexOf('Preview') > -1) instance.isPreview = true
}
