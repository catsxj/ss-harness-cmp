/**
 * Created by HaijunZhang on 2019/1/4.
 */
// 软件安装集群数据重组
export function handleGroupData(graph, node) {
  const groupNode = graph.getCellById(node.config.parent)
  const nodes = groupNode.getChildren().filter((item) => item.isNode())
  const groups = []
  let hosts = []
  const target = {
    authenMode: 'SINGLE',
    sudo: true,
    data: []
  }
  const depend = {
    type: 'host',
    data: []
  }
  // 分组内节点
  nodes.forEach((item) => {
    const model = item.getData()
    if (model.ignore) {
      const { input: { depend: dependData = { data: [] }, target: targetData = { data: [] } } = {} } = model
      const obj = {
        name: model.role,
        hosts: []
      }
      dependData.data.forEach((item) => {
        obj.hosts.push({ host: item })
      })
      targetData.data.forEach((item) => {
        obj.hosts.push({ taskTargetUuid: item.taskTargetUuid })
      })
      hosts = hosts.concat(obj.hosts)
      groups.push(obj)
      depend.data = depend.data.concat(dependData.data)
      target.data = target.data.concat(targetData.data)
    }
  })
  if (node.code === 'task.software.mysql') {
    // mysql特殊处理
    groups.push({
      name: 'mysql',
      hosts: hosts
    })
  }
  node.input.fronts.groups = groups
  node.input = {
    ...node.input,
    target,
    depend
  }
}
// 初始化数据处理
export function handleArrAttribute(arr, self) {
  arr.forEach((attr) => {
    if (!self.itemData[attr]) {
      self.$set(self.itemData, attr, [])
    }
  })
}
// oracle特殊化数据处理
export function handleOracleData(node) {
  const {
    input: {
      depend = { data: [] },
      target = { data: [] },
      fronts,
      fronts: { manage_config }
    }
  } = node
  const middleStr = fronts.cluster_install ? 'rac' : 'si'
  const name = `oracle-${middleStr}`
  manage_config.hostgroup = name
  // 版本号去掉. + base
  manage_config.install_name = `${fronts.version.split('.').join('')}-base`
  if (fronts.cluster_install) manage_config.cluster_master = `${middleStr}1`
  const groups = {
    name: name,
    hosts: []
  }
  let i = 1
  depend.data.forEach((item) => {
    groups.hosts.push({ host: item, vars: { alias: `${middleStr}${i}` } })
    i++
  })
  target.data.forEach((item) => {
    groups.hosts.push({ host: item.host, vars: { alias: `${middleStr}${i}` } })
    i++
  })
  fronts.groups = [groups]
}
// groups特殊化数据处理
export function handleSingleGroups(node) {
  const {
    input: { depend = { data: [] }, target = { data: [] }, fronts },
    code
  } = node
  const nameMap = {
    'task.software.kafka': 'kafka',
    'task.software.postgresql': 'postgres_cluster',
    'task.software.nfs.server': 'nfs_server',
    'task.software.nfs.client': 'nfs_client',
    'task.software.zookeeper': 'zookeeper',
    'task.software.mongodb': 'mongo_master',
    'task.software.mysql': 'mysql_master',
    'task.software.iscsi.server': 'iscsi_server',
    'task.software.iscsi.client': 'iscsi_client'
  }
  const groups = {
    name: nameMap[code],
    hosts: []
  }
  depend.data.forEach((item) => {
    groups.hosts.push({ host: item })
  })
  target.data.forEach((item) => {
    groups.hosts.push({ taskTargetUuid: item.taskTargetUuid })
  })
  fronts.groups = [groups]
  // mysql特殊处理
  if (code === 'task.software.mysql') {
    fronts.groups.push({
      name: 'mysql',
      hosts: groups.hosts
    })
  }
}
