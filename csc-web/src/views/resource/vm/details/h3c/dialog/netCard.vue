<template>
  <el-dialog append-to-body :title="addData.title" :visible.sync="addData.dialog" width="800px" v-if="addData.dialog">
    <el-form ref="data" :model="addData.data" :status-icon="true" label-width="120px">
      <basic-form-item label="IP地址池：" prop="ipPoolId" validate="required">
        <el-select class="w" v-model="addData.data.ipPoolId" @change="ipPoolIdChange">
          <el-option v-for="(item, index) in networkRelations" :label="item.ipPoolName" :value="item.ipPoolId" :key="index"></el-option>
        </el-select>
        <el-radio-group class="m-l-md" v-model="addData.data.ipPolicy" size="mini" @change="getIp()" :disabled="!addData.data.ipPoolId">
          <el-radio-button label="Auto">自动</el-radio-button>
          <el-radio-button label="Manual">手动</el-radio-button>
        </el-radio-group>
        <template v-if="addData.data.ipPolicy && addData.data.ipPolicy === 'Manual'">
          <el-select v-loading="addData.data.loading" placeholder="请输入IP进行搜索" filterable class="m-l-md w" v-model="addData.data.address" size="small" multiple :multiple-limit="1" @visible-change="flag => conditionIp(flag)" :filter-method="query => ipFilter(query)" @change="selectIpChange">
            <el-option v-for="item in addData.data.showIps" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </template>
      </basic-form-item>
      <basic-form-item label="MTU（字节）：" prop="mtu" validate="required">
        <el-input-number v-model="addData.data.mtu" :min="1000" :max="9000"></el-input-number>
      </basic-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
      <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getNetworkRelations, modifyVm, conditionIp, getSubnet, getVpc, getGroup } from 'services/platform/index'
import { getPoolDetail } from 'services/platform/pool'
import { cloneDeep, uniq } from 'lodash-es'

export default {
  props: {
    addData: {
      type: Object
    },
    parentData: {
      type: Object
    }
  },
  data() {
    return {
      networkRelations: [],
      loading: false
    }
  },
  created() {
    this.getNetworkRelations()
  },
  methods: {
    getNetworkRelations() {
      if (!this.addData.poolGroupId) {
        this.networkRelations = []
        return
      }
      getPoolDetail(this.addData.poolGroupId).then(data => {
        if (data.success) {
          this.networkRelations = data.data.networkRelations
        }
      })
    },
    ipPoolIdChange(val) {
      this.getIp()
      this.addData.data.vswitchId = this.networkRelations.find(item => item.ipPoolId == val).portGroupId
    },
    getIp() {
      const findIppool = this.networkRelations.find(({ ipPoolId }) => ipPoolId === this.addData.data.ipPoolId) || {}
      this.addData.data.ipPoolName = findIppool.ipPoolName
      this.addData.data.portGroupId = findIppool.portGroupId || ''
      if (this.addData.data.ipPolicy != 'Manual' || !this.addData.data.ipPoolId) {
        this.addData.data.address = []
        return
      }
      this.$set(this.addData.data, 'loading', true)
      conditionIp({ condition: JSON.stringify({ condition: 'listByPoolAndStatus', poolId: this.addData.data.ipPoolId, status: 'free' }) })
        .then(data => {
          if (data.success) {
            // 空闲的所有 ip
            // Vue 禁止响应式
            const freezeAllIps = Object.freeze(data.data.map(({ ip }) => ip))
            // 上一节点的虽然锁定,但是也是可选
            this.$set(findIppool, 'freezeAllIps', freezeAllIps)
            // 校验数量
            if (freezeAllIps.length) {
              const address = []
              freezeAllIps.forEach(ip => {
                if (this.addData.data.address.includes(ip)) {
                  // 原本就在里面 || 没被使用过
                  address.push(ip)
                }
              })
              this.addData.data.address = address
              this.$set(this.addData.data, 'showIps', freezeAllIps.slice(0, 20))
            } else {
              this.$message.warning('可用 IP 数量不足')
              this.addData.data.address = []
              this.addData.data.ipPoolId = ''
              this.addData.data.portGroupId = ''
              this.addData.data.ipPolicy = 'Manual'
            }
          }
        })
        .catch(err => {
          console.log(err)
          this.$message.warning('获取 IP 失败')
          this.addData.data.address = []
          this.addData.data.ipPolicy = 'Auto'
        })
        .finally(() => (this.addData.data.loading = false))
    },
    conditionIp(flag) {
      // 下拉框出现
      if (flag) return
      const { address = [], ipPoolId } = this.addData.data
      if (!address.length) return
      conditionIp({
        condition: JSON.stringify({
          condition: 'checkIp',
          poolId: ipPoolId,
          ips: address
        })
      }).then(data => {
        if (!data.success) {
          this.$message.success(data.message)
          this.addData.data.address = []
        }
      })
    },

    ipFilter(query = '') {
      const freezeAllIps = this.networkRelations.find(({ ipPoolId }) => ipPoolId === this.addData.data.ipPoolId)?.freezeAllIps || []
      if (!query) return freezeAllIps.slice(0, 20)
      // 已过滤
      const arr = freezeAllIps.filter(ip => ip.includes(query)).slice(0, 20)
      // 合并并去重
      this.$set(this.addData.data, 'showIps', uniq([...this.addData.data.address, ...arr]))
      return this.addData.data.showIps
    },

    selectIpChange() {
      if (!this.addData.data.address.length) this.addData.data.showIps = this.networkRelations.find(({ ipPoolId }) => ipPoolId === this.addData.data.ipPoolId).freezeAllIps.slice(0, 20)
    },
    formatNetworks() {
      const toObjFormat = function (obj) {
        for (const a in obj) {
          if (obj[a] === '') delete obj[a]
        }
        return obj
      }
      const arr = []
      const obj = toObjFormat({
        name: this.addData.data.name,
        type: this.addData.data.type,
        portType: this.addData.data.portType,
        mac: this.addData.data.mac,
        label: this.addData.data.label,
        operation: this.addData.data.operation,
        ipId: this.addData.data.ipId,
        ipPoolId: this.addData.data.ipPoolId,
        address: this.addData.data.address,
        ciscoSubnetId: this.addData.data.ciscoSubnetId,
        disLabel: this.addData.data.disLabel,
        vswitchId: this.addData.data.vswitchId,
        mtu: this.addData.data.mtu
      })
      if (this.addData.data.type == undefined) {
        delete this.addData.data.type
      }
      arr.push(obj)
      return arr
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const data = {
            id: this.addData.id,
            operations: this.formatNetworks()
          }
          this.loading = true
          modifyVm(data)
            .then(data => {
              if (data.success) {
                this.$message.success(data.message)
                this.addData.dialog = false
              }
            })
            .finally(() => (this.loading = false))
        }
      })
    }
  }
}
</script>
