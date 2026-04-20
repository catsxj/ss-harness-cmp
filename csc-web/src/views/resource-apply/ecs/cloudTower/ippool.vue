<template>
  <basic-form-item label="网卡：" class="m-b-lg">
    <el-row>
      <el-col :span="24" v-for="(cell, index) in configs.networkCardConfigs" :key="index" class="m-b">
        <el-select class="w" v-model="cell.ipPoolId" @change="getIp(cell)">
          <el-option :label="item.ipPoolName" :value="item.ipPoolId" v-for="(item, index) in ippools" :key="index"></el-option>
        </el-select>
        <el-select v-loading="cell.loading" placeholder="请输入IP进行搜索" filterable class="m-l-md w" v-model="cell.ipAddress" size="small" multiple @visible-change="flag => conditionIp(flag, cell)" :filter-method="query => ipFilter(query, cell)" @change="selectIpChange(cell)">
          <el-option v-for="item in cell.showIps" :key="item" :label="item" :value="item" :disabled="calcAddress(cell, item)"></el-option>
        </el-select>
        <!-- <el-button @click="addCard" icon="el-icon-plus"  size="mini" type="primary"></el-button> -->
      </el-col>
    </el-row>
  </basic-form-item>
</template>
<script>
import { conditionIp } from 'services/platform/index'
import { isArray, cloneDeep, uniq } from 'lodash-es'
export default {
  components: {},
  props: {
    addData: {
      type: Object
    },
    disabled: {
      type: Boolean
    },
    retention: {
      type: [Object, Boolean]
    }
  },
  data() {
    return {
      ippools: [],
      prefixNodeIps: {}
    }
  },
  computed: {
    configs() {
      return this.addData.configs
    },
    count() {
      const {
        nodes = 1,
        emption: { count }
      } = this.addData
      return nodes * count
    },
    selectedIps() {
      const ips = []
      this.addData.configs.networkCardConfigs.map(({ ipAddress }) => {
        ips.push(...ipAddress)
      })
      return ips
    }
  },
  created() {
    this.getIpPool()
    this.configs.networkCardConfigs.map(item => {
      if (!isArray(item.ipAddress)) item.ipAddress = [item.ipAddress]
      if (item.ipAddress.length) {
        if (this.prefixNodeIps[item.ipPoolId]) {
          this.prefixNodeIps[item.ipPoolId].push(...item.ipAddress)
        } else {
          this.prefixNodeIps[item.ipPoolId] = [...item.ipAddress]
        }
      }
      this.getIp(item, !!this.retention)
    })
  },
  watch: {
    count() {
      this.configs.networkCardConfigs.map(item => {
        this.getIp(item)
      })
    },
    'addData.networkRelations'() {
      this.getIpPool(true)
    }
  },
  methods: {
    addCard() {
      this.configs.networkCardConfigs.push({
        operation: 'newNet',
        networkId: '',
        mac: '',
        model: 'VIRTIO',
        ipAddress: '', // 对应一个ip，可以为空
        netmask: '',
        link: 'up'
      })
    },

    conditionIp(flag, cell = {}) {
      // 下拉框出现
      if (flag) return
      const { ipAddress = [], ipPoolId } = cell
      if (!ipAddress.length) return
      // 上一个审批节点时传输的,就已经是锁定状态了
      // 以 addresses 为基础, 过滤不在 prefixNodeIps 中的 ip
      const filterAddress = ipAddress.filter(ip => !this.prefixNodeIps[cell.ipPoolId]?.includes(ip))
      if (!filterAddress.length) return
      conditionIp({
        condition: JSON.stringify({
          condition: 'checkIp',
          poolId: ipPoolId,
          ips: filterAddress
        })
      }).then(data => {
        if (!data.success) {
          this.$message.success(data.message)
          cell.ipAddress = []
        }
      })
    },
    selectIpChange(cell) {
      if (!cell.ipAddress.length) cell.showIps = this.ippools.find(({ ipPoolId }) => ipPoolId === cell.ipPoolId).freezeAllIps.slice(0, 20)
    },
    calcAddress(cell, ip) {
      // 其他虚机中是否已经选择过 禁用
      let flag = false
      if (this.selectedIps.includes(ip)) flag = true
      // 超出数量禁用
      if (cell.ipAddress.length >= this.count) flag = true
      return flag
    },
    ipFilter(query = '', cell) {
      const freezeAllIps = this.ippools.find(({ ipPoolId }) => ipPoolId === cell.ipPoolId)?.freezeAllIps || []
      if (!query) return freezeAllIps.slice(0, 20)
      // 上个节点已选
      const preIps = this.prefixNodeIps[cell.ipPoolId]?.filter(ip => ip.includes(query)) || []
      // 已过滤
      const arr = freezeAllIps.filter(ip => ip.includes(query)).slice(0, 20)
      // 合并并去重
      this.$set(cell, 'showIps', uniq([...preIps, ...cell.ipAddress, ...arr]))
      return cell.showIps
    },

    getIp(obj, isInit = false) {
      if (this.disabled) return
      const findIppool = this.ippools.find(({ ipPoolId }) => ipPoolId === obj.ipPoolId) || {}
      if (!obj.ipPoolId) {
        obj.ipAddress = []
        return
      }
      obj.loading = true
      conditionIp({ condition: JSON.stringify({ condition: 'listByPoolAndStatus', poolId: obj.ipPoolId, status: 'free' }) })
        .then(data => {
          if (data.success) {
            // 空闲的所有 ip
            // Vue 禁止响应式
            const freezeAllIps = Object.freeze(uniq([...(this.prefixNodeIps[obj.ipPoolId] || []), ...data.data.map(({ ip }) => ip)]))
            // 上一节点的虽然锁定,但是也是可选
            this.$set(findIppool, 'freezeAllIps', freezeAllIps)
            // 校验数量
            if (freezeAllIps.length) {
              const ipAddress = []
              freezeAllIps.forEach(ip => {
                if (ipAddress.length === this.count) return
                if (isInit) {
                  // 审批回显初始化
                  ipAddress.push(...obj.ipAddress)
                } else if (obj.ipAddress.includes(ip) || !this.selectedIps.includes(ip)) {
                  // 原本就在里面 || 没被使用过
                  ipAddress.push(ip)
                }
              })
              obj.ipAddress = ipAddress
              this.$set(obj, 'showIps', freezeAllIps.slice(0, 20))
            } else {
              this.$message.warning('可用 IP 数量不足')
              obj.ipAddress = []
              obj.ipPoolId = ''
            }
          }
        })
        .finally(() => (obj.loading = false))
    },
    getIpPool(manual) {
      if (manual) {
        // 切换资源池回显
        this.addData.configs.networkCardConfigs.map(item => {
          item.ipPoolId = ''
        })
      }
      this.ippools = []
      this.addData.networkRelations.forEach(item => {
        this.ippools.push(cloneDeep(item))
      })
    }
  }
}
</script>
<style lang="scss" scoped></style>
