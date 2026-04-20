export default {
  data() {
    return {
      isPreview: this.$route.name.indexOf('Preview') > -1, // 详情预览
      isTemplate: this.$route.name.indexOf('Tpl') > -1, // 模板下不显示目标机器
      isTaskInstance: this.$route.name.indexOf('Instance') > -1,
      isConsole: this.$route.name.indexOf('Service') > -1, // 自服务界面隐藏应用系统
      isHistoryDetail: this.$route.name.indexOf('History') > -1, // 执行历史的详情
      serverCount: {}
    }
  },
  computed: {
    moduleMap() {
      return this.$store.state.graph.moduleMap
    },
    graph() {
      return this.$store.state.graph.editor.graph
    },
    isHideSudo() {
      return this.currentNode?.code.includes('task.software')
    }
  },
  methods: {
    // 判断目标机器是否有误
    judgeTargetHost(node) {
      const {
        input: {
          fronts: { cluster_install },
          target,
          depend
        },
        mainNode,
        code,
        role,
        ignore,
        pid
      } = node
      // 模板或者集群部署主节点不对目标机器校验
      if (!this.isTaskInstance || mainNode) return true
      const template = JSON.parse(this.moduleMap[code].template)
      if (template) {
        let nodeRule = { limits: '^[1-9]\\d*$' }
        // 对节点机器数量做限制
        if (template.limits) {
          const { limits, limits_message, sign, sign_message } = template.limits[cluster_install ? 'cluster' : 'standalone']
          nodeRule = { limits, limits_message, sign, sign_message }
        }
        // 集群部署角色节点
        if (ignore) {
          nodeRule = this.getRoleRuleConfig(role, pid)
        }
        console.log(nodeRule)
        return this.judgeTargetHostCount(node, nodeRule)
      }
      if (depend && !((target || { data: [] }).data.length + depend.data.length)) {
        this.$message.error('请选择目标机器')
        return false
      }
      return true
    },
    // 集群节点查找配置
    getRoleRuleConfig(role, mainNodeId) {
      const role1 = role.split('_')[0]
      const roleMap = {
        mongo: 'mongodb',
        mysql: 'mysql',
        redis: 'redis',
        rocketmq: 'rocketmq',
        memcached: 'memcache',
        magent: 'memcache',
        iscsi: 'iscsi'
      }
      const {
        input: {
          fronts: { cluster_type }
        }
      } = this.graph.getCellById(mainNodeId).getData()
      const cluster = JSON.parse(this.moduleMap[`task.software.${roleMap[role1]}`].template).deploy.cluster
      const map = {}
      // 集群部署分为多个方案，每种方案对机器限制不同
      const arr = cluster_type ? cluster[cluster_type] : cluster.topo
      arr.forEach(item => {
        map[item.role] = item
      })
      return map[role]
    },
    // 判断目标机器数量是否符合要求
    judgeTargetHostCount(node, nodeRule) {
      const {
        input: { target = { data: [] }, depend = { data: [] } },
        role
      } = node
      let success = true
      const serverLength = target.data.length + depend.data.length
      const reg = new RegExp(nodeRule.limits, 'g')
      if (!reg.test(serverLength)) {
        this.$message.error(nodeRule.limits_message || '请选择主机')
        success = false
      }
      // 两个角色节点之间数量限制
      if (nodeRule.sign) {
        const count = this.serverCount[nodeRule.object]
        const sign = nodeRule.sign
        this.serverCount[role] = serverLength
        if (count && sign === '>=') {
          if (count && count > serverLength) {
            this.$message.error(nodeRule.sign_message)
            success = false
          }
        }
        if (count && sign === '<=') {
          if (count && count < serverLength) {
            this.$message.error(nodeRule.sign_message)
            success = false
          }
        }
      }
      return success
    }
  }
}
