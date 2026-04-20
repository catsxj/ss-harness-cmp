<template>
  <basic-form-item label="网卡：" class="m-b-lg">
    <el-row>
      <el-col :span="24" v-for="(cell, index) in configs.networkCardConfigs" :key="index" class="m-b">
        <el-select class="w" v-model="cell.ipPoolId" @change="getIp(cell)">
          <el-option :label="item.ipPoolName" :value="item.ipPoolId" v-for="(item, index) in ippools" :key="index"></el-option>
        </el-select>
        <el-radio-group class="m-l-md" v-model="cell.ipPolicy" size="small" @change="getIp(cell)">
          <el-radio-button label="Auto">自动</el-radio-button>
          <!-- <el-radio-button label="Dhcp">DHCP</el-radio-button> -->
          <el-radio-button label="Manual">手动</el-radio-button>
        </el-radio-group>
        <template v-if="cell.ipPolicy && cell.ipPolicy === 'Manual'">
          <el-select v-loading="cell.loading" placeholder="请输入IP进行搜索" filterable class="m-l-md w" v-model="cell.address" size="small" multiple @visible-change="(flag) => conditionIp(flag, cell)" :filter-method="(query) => ipFilter(query, cell)" @change="selectIpChange(cell)">
            <el-option v-for="item in cell.showIps" :key="item" :label="item" :value="item" :disabled="calcAddress(cell, item)"></el-option>
          </el-select>
        </template>
        <!-- <el-button type="text" class="m-l-md" @click="addCard">新增</el-button>
        <el-button type="text" class="m-l-md" v-if="configs.networkCardConfigs.length > 1" @click="configs.networkCardConfigs.splice(index, 1)">删除</el-button> -->
      </el-col>
    </el-row>
  </basic-form-item>
</template>
<script>
import { conditionIp } from 'services/platform/index'
import { cloneDeep, uniq } from 'lodash-es'
export default {
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
      this.addData.configs.networkCardConfigs.map(({ ipPolicy, address }) => {
        if (ipPolicy == 'Manual') {
          ips.push(...address)
        }
      })
      return ips
    }
  },
  created() {
    this.getIpPool()
    this.configs.networkCardConfigs.map((item) => {
      if (item.address.length) {
        if (this.prefixNodeIps[item.ipPoolId]) {
          this.prefixNodeIps[item.ipPoolId].push(...item.address)
        } else {
          this.prefixNodeIps[item.ipPoolId] = [...item.address]
        }
      }
      this.getIp(item, !!this.retention)
    })
  },
  watch: {
    count() {
      this.configs.networkCardConfigs.map((item) => {
        this.getIp(item)
      })
    },
    'addData.networkRelations'() {
      this.getIpPool(true)
    }
  },
  methods: {
    addCard() {
      if (this.configs.networkCardConfigs.length === 3) return this.$message.warning('最多添加3张网卡')
      const first = this.configs.networkCardConfigs[0]
      this.configs.networkCardConfigs.push({
        ipPolicy: 'Auto',
        ipPoolId: '',
        address: [],
        loading: false
      })
    },
    conditionIp(flag, cell = {}) {
      // 下拉框出现
      if (flag) return
      const { address = [], ipPoolId } = cell
      if (!address.length) return
      // 上一个审批节点时传输的,就已经是锁定状态了
      // 以 addresses 为基础, 过滤不在 prefixNodeIps 中的 ip
      const filterAddress = address.filter((ip) => !this.prefixNodeIps[cell.ipPoolId]?.includes(ip))
      if (!filterAddress.length) return
      conditionIp({
        condition: JSON.stringify({
          condition: 'checkIp',
          poolId: ipPoolId,
          ips: filterAddress
        })
      }).then((data) => {
        if (!data.success) {
          this.$message.success(data.message)
          cell.address = []
        }
      })
    },
    selectIpChange(cell) {
      if (!cell.address.length) cell.showIps = this.ippools.find(({ ipPoolId }) => ipPoolId === cell.ipPoolId).freezeAllIps.slice(0, 20)
    },
    calcAddress(cell, ip) {
      // 其他虚机中是否已经选择过 禁用
      let flag = false
      if (this.selectedIps.includes(ip)) flag = true
      // 超出数量禁用
      if (cell.address.length >= this.count) flag = true
      return flag
    },
    ipFilter(query = '', cell) {
      const freezeAllIps = this.ippools.find(({ ipPoolId }) => ipPoolId === cell.ipPoolId)?.freezeAllIps || []
      if (!query) return freezeAllIps.slice(0, 20)
      // 上个节点已选
      const preIps = this.prefixNodeIps[cell.ipPoolId]?.filter((ip) => ip.includes(query)) || []
      // 已过滤
      const arr = freezeAllIps.filter((ip) => ip.includes(query)).slice(0, 20)
      // 合并并去重
      this.$set(cell, 'showIps', uniq([...preIps, ...cell.address, ...arr]))
      return cell.showIps
    },

    getIp(obj, isInit = false) {
      if (this.disabled) return
      const findIppool = this.ippools.find(({ ipPoolId }) => ipPoolId === obj.ipPoolId) || {}
      if (obj.ipPolicy != 'Manual' || !obj.ipPoolId) {
        obj.address = []
        return
      }
      obj.loading = true
      conditionIp({ condition: JSON.stringify({ condition: 'listByPoolAndStatus', poolId: obj.ipPoolId, status: 'free' }) })
        .then((data) => {
          if (data.success) {
            // 空闲的所有 ip
            // Vue 禁止响应式
            const freezeAllIps = Object.freeze(uniq([...(this.prefixNodeIps[obj.ipPoolId] || []), ...data.data.map(({ ip }) => ip)]))
            // 上一节点的虽然锁定,但是也是可选
            this.$set(findIppool, 'freezeAllIps', freezeAllIps)
            // 校验数量
            if (freezeAllIps.length) {
              const address = []
              freezeAllIps.forEach((ip) => {
                if (address.length === this.count) return
                if (isInit) {
                  // 审批回显初始化
                  address.push(...obj.address)
                } else if (obj.address.includes(ip) || !this.selectedIps.includes(ip)) {
                  // 原本就在里面 || 没被使用过
                  address.push(ip)
                }
              })
              obj.address = address
              this.$set(obj, 'showIps', freezeAllIps.slice(0, 20))
            } else {
              this.$message.warning('可用 IP 数量不足')
              obj.address = []
              obj.ipPoolId = ''
              obj.portGroupId = ''
              obj.ipPolicy = 'Manual'
            }
          }
        })
        .finally(() => (obj.loading = false))
    },
    getIpPool(manual) {
      if (manual) {
        // 切换资源池回显
        this.addData.configs.networkCardConfigs.map((item) => {
          item.ipPoolId = ''
        })
      }
      this.ippools = []
      this.addData.networkRelations.forEach((item) => {
        if (item.version == 'V4') this.ippools.push(cloneDeep(item))
      })
    }
  }
}
</script>
<style lang="scss" scoped></style>
