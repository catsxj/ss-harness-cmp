/**
 * Created by Zhang Haijun on 2018/3/20.
 */
import common from './common'

export default {
  getTaskList() {
    const template = {
      id: '@increment',
      name: '@title',
      creator: '@cname',
      mender: '@cname',
      gmtCreate: "@datetime('yyyy-MM-dd HH:mm:ss')",
      gmtModify: "@datetime('yyyy-MM-dd HH:mm:ss')"
    }
    return common.getList(template)
  },
  getTaskDetail() {
    const template = {
      id: '@increment',
      name: '@title',
      taskGroup: 'DEVICE_INIT',
      graph:
        '{"nodes":[{"catalog":"START","name":"开始节点","location":{"x":80,"y":140},"nodeId":1521013231471},{"catalog":"END","name":"结束节点","location":{"x":800,"y":140},"nodeId":1521013232191},{"catalog":"TASK","retryTime":3,"params":{"database":"MySQL","dbdriver":"com.mysql.jdbc.Driver","password":"onceas","scriptId":168,"groupId":[3],"category":"SQL","content":"select * from user","username":"root"},"timeout":600,"target":[{"url":"10.20.2.48:3306/bsm_dev"}],"intervals":10,"failover":false,"name":"test","location":{"x":400,"y":137},"sudo":false,"category":"DATABASE","nodeId":1521013242696,"identId":""}],"links":[{"nodeZid":1521013242696,"linetype":"Link","nodeAid":1521013231471},{"nodeZid":1521013232191,"linetype":"Link","nodeAid":1521013242696}]}'
    }
    return common.getDetail(template)
  }
}
