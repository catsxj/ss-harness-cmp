export const clusterTypeList = [
  {
    name: '主从模式(一主一从)',
    value: 'msv'
  },
  {
    name: '主备模式(一主一从)',
    value: 'msb'
  },
  {
    name: 'MHA模式(一主两从)',
    value: 'mha'
  },
  {
    name: 'MGR单主(一主两从)',
    value: 'mgr.single'
  },
  {
    name: 'MGR多主(三|五|七)',
    value: 'mgr.multi'
  }
]
export const redisClusterTypeList = [
  {
    name: '一主两从',
    value: 'omts'
  },
  {
    name: '一主两从三哨兵',
    value: 'omtsts'
  },
  {
    name: '三主三从',
    value: 'tmts'
  }
]
const translateArrToMap = (list: any[]) => {
  const map: any = {}
  list.forEach(item => {
    const { name, value } = item
    map[value] = name
  })
  return map
}
export const clusterModeTypeMap = translateArrToMap([...clusterTypeList, ...redisClusterTypeList])

export const clusterTypeMap = {
  'task.software.mongodb': '一主两从一仲裁',
  'task.software.memcache': '一主一备一代理',
  'task.software.rocketmq': '两主两从一服务',
  'task.software.iscsi': ''
}
