<template>
  <el-dialog title="网络配置" :visible.sync="dialog.visible" width="800px" append-to-body>
    <basic-form :model="configs" ref="addData" :disabled="disabled">
      <div v-if="subLocation.isPublic">
        <basic-form-item label="所属网络：" validate="required" prop="subnetId" required-message="请选择子网">
          <el-select class="w m-r" v-model="configs.vpcId" @change="changeVPC" placeholder="请选择VPC" filterable>
            <el-option v-for="item in dialog.row.vpcList" :label="`${item.name}(${item.vpcId})`" :value="item.id" :key="item.id"></el-option>
          </el-select>
          <el-select class="w" v-model="configs.subnetId" @change="changeSubnet(configs)" placeholder="请选择子网" filterable>
            <el-option v-for="item in dialog.row.subnetList" :label="item.name" :value="item.id" :key="item.id"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="安全组：" validate="required" prop="groups">
          <el-select v-model="configs.groups" multiple placeholder="请选择安全组" filterable>
            <el-option v-for="item in dialog.row.groupList" :label="`${item.name}(${item.value})`" :value="item.value" :key="item.value"></el-option>
          </el-select>
        </basic-form-item>
      </div>
      <div v-else>
        <div :span="24" v-for="(cell, index) in configs.networkCardConfigs" :key="index" class="m-b">
          <basic-form-item label="IP池：" validate="required" :prop="`networkCardConfigs.${index}.ipPoolId`">
            <el-select class="w" v-model="cell.ipPoolId" @change="getIp(cell)" placeholder="请选择 IP 池" filterable>
              <el-option :label="item.ipPoolName" :value="item.ipPoolId" v-for="(item, index) in ippools" :key="index"></el-option>
            </el-select>
            <el-radio-group class="m-l-md" v-model="cell.ipPolicy" size="mini" @change="getIp(cell)">
              <el-radio-button label="Auto">自动</el-radio-button>
              <el-radio-button label="Manual">手动</el-radio-button>
            </el-radio-group>
            <template v-if="cell.ipPolicy && cell.ipPolicy === 'Manual'">
              <el-select v-loading="cell.loading" placeholder="请输入IP进行搜索" filterable class="m-l-md w" v-model="cell.address" size="small" multiple @visible-change="flag => conditionIp(flag, cell)" :filter-method="query => ipFilter(query, cell)" @change="selectIpChange(cell)">
                <el-option v-for="item in cell.showIps" :key="item" :label="item" :value="item" :disabled="calcAddress(cell, item)"></el-option>
              </el-select>
            </template>
            <el-button type="text" class="m-l-md" v-if="configs.networkCardConfigs.length > 1" @click="configs.networkCardConfigs.splice(index, 1)">删除</el-button>
          </basic-form-item>
          <basic-form-item label="" v-if="index === configs.networkCardConfigs.length - 1">
            <el-button type="text" @click="addCard">新增</el-button>
          </basic-form-item>
        </div>
      </div>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click.native="dialog.visible = false">取消</el-button>
      <el-button type="primary" @click.native="handleSubmit">确定</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { conditionIp, getSubnet, getVpc, getGroup } from 'services/platform/index'
import { cloneDeep, uniq } from 'lodash-es'
export const NETCARD_DEFAULT_CONFIG = {
  networkCardId: '',
  ipPoolName: '',
  address: [],
  portGroupId: '',
  loading: false,
  ipPoolId: '',
  ipPolicy: 'Auto'
}

export const CECSTACK_DEFAULT_CONFIG = {
  networkType: 'Geneve'
}
export const CLOUDTOWER_DEFAULT_CONFIG = {
  operation: 'newNet',
  mac: '',
  model: 'VIRTIO',
  netmask: '',
  link: 'up'
}
export default {
  props: {
    dialog: {
      type: Object,
      default: () => {}
    },
    itemData: {
      type: [Object, Boolean]
    },
    disabled: {
      type: Boolean
    },
    showParamList: {
      type: Array
    }
  },
  data() {
    return {
      ippools: [],
      prefixNodeIps: {}
    }
  },
  computed: {
    subLocation() {
      return this.dialog.row.subLocation
    },
    configs() {
      return this.dialog.row.configs
    },
    count() {
      const {
        nodes = 1,
        emption: { count }
      } = this.dialog.row
      return nodes * count
    },
    selectedIps() {
      const ips = []
      // 其他虚机组
      this.showParamList.map(item => {
        if (item.taskGroupUuid !== this.dialog.row.taskGroupUuid) {
          item.configs.networkCardConfigs.map(({ ipPolicy, address }) => {
            if (ipPolicy == 'Manual') {
              ips.push(...address)
            }
          })
        } else {
          // 当前虚机组
          this.configs.networkCardConfigs.map(({ ipPolicy, address }) => {
            if (ipPolicy == 'Manual') {
              ips.push(...address)
            }
          })
        }
      })

      return ips
    }
  },
  created() {
    this.getIpPool()
    this.getSgroupList()
    this.getVpcList()
    this.configs.networkCardConfigs.map(item => {
      if (item.address.length) {
        if (this.prefixNodeIps[item.ipPoolId]) {
          this.prefixNodeIps[item.ipPoolId].push(...item.address)
        } else {
          this.prefixNodeIps[item.ipPoolId] = [...item.address]
        }
      }
      this.getIp(item, !!this.itemData)
    })
  },
  watch: {
    count() {
      this.configs.networkCardConfigs.map(item => {
        this.getIp(item)
      })
    }
  },
  methods: {
    addCard() {
      if (this.configs.networkCardConfigs.length === 3) return this.$message.warning('最多添加3张网卡')
      const first = this.configs.networkCardConfigs[0]
      let config = {}
      switch (this.subLocation.vendorType) {
        case 'QCLOUD':
        case 'ALIYUN':
        case 'MANAGEONE':
        case 'HUAWEI':
          break
        case 'CECSTACK':
          config = { ...CECSTACK_DEFAULT_CONFIG }
          break
        case 'SUGONCLOUD':
          config = { ...CECSTACK_DEFAULT_CONFIG }
          break
        case 'CLOUDTOWER':
          config = CLOUDTOWER_DEFAULT_CONFIG
          break
        default:
          break
      }
      this.configs.networkCardConfigs.push({
        ...NETCARD_DEFAULT_CONFIG,
        networkCardId: first.networkCardId,
        ...config
      })
    },
    conditionIp(flag, cell = {}) {
      // 下拉框出现
      if (flag) return
      const { address = [], ipPoolId } = cell
      if (!address.length) return
      // 上一个审批节点时传输的,就已经是锁定状态了
      // 以 addresses 为基础, 过滤不在 prefixNodeIps 中的 ip
      const filterAddress = address.filter(ip => !this.prefixNodeIps[cell.ipPoolId]?.includes(ip))
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
      const preIps = this.prefixNodeIps[cell.ipPoolId]?.filter(ip => ip.includes(query)) || []
      // 已过滤
      const arr = freezeAllIps.filter(ip => ip.includes(query)).slice(0, 20)
      // 合并并去重
      this.$set(cell, 'showIps', uniq([...preIps, ...cell.address, ...arr]))
      return cell.showIps
    },
    getVpcList() {
      if (this.disabled || !this.subLocation.isPublic || !this.subLocation.vendorId || !this.subLocation.region) return
      getVpc({
        simple: true,
        params: this.$tools.handleSearchParam({
          vendorId: this.subLocation.vendorId,
          regionId: this.subLocation.region
        })
      }).then(data => {
        if (data.success) {
          this.$set(
            this.dialog.row,
            'vpcList',
            data.data.rows.map(({ id, name, vpcId }) => ({ id, name, vpcId }))
          )
          if (this.subLocation.isPublic && this.configs.vpcId) this.getSubnet()
        }
      })
    },
    getSgroupList() {
      if (this.disabled || !this.subLocation.isPublic || !this.subLocation.vendorId || !this.subLocation.region) return
      const params = {
        simple: true,
        params: this.$tools.handleSearchParam({
          vendorId: this.subLocation.vendorId,
          regionId: this.subLocation.region
        })
      }
      getGroup(params).then(data => {
        if (data.success) {
          this.dialog.row.groupList = data.data.rows
        }
      })
    },
    changeVPC() {
      this.configs.subnetId = ''
      this.configs.subnetUuid = ''
      this.configs.subnetName = ''
      const find = this.dialog.row.vpcList.find(item => item.id === this.configs.vpcId)
      this.configs.vpcName = find?.name || ''
      this.configs.vpcUuid = find?.vpcId || ''
      this.getSubnet()
    },
    changeSubnet() {
      const find = this.dialog.row.subnetList.find(item => item.id === this.configs.subnetId)
      this.configs.subnetName = find?.name || ''
      this.configs.subnetUuid = find?.value || ''
    },
    // 获取子网
    getSubnet() {
      const params = {
        simple: true,
        params: JSON.stringify([
          {
            param: {
              vpcUuid: this.configs.vpcUuid,
              zone: this.subLocation.vendorType === 'SUGONCLOUD' ? null : this.subLocation.az,
              vendorId: this.subLocation.vendorId
            },
            sign: 'EQ'
          }
        ])
      }
      getSubnet(params).then(data => {
        if (data.success) {
          this.dialog.row.subnetList = data.data.rows
        }
      })
    },
    getIp(obj, isInit = false) {
      if (this.disabled) return
      const findIppool = this.ippools.find(({ ipPoolId }) => ipPoolId === obj.ipPoolId) || {}
      obj.ipPoolName = findIppool.ipPoolName
      obj.portGroupId = findIppool.portGroupId || ''
      if (!obj.ipPoolId) {
        obj.address = []
        return
      }
      // 任何情况都是会用调用获取 ip 的接口,目的是校验当前 ip 池是否还有空闲 ip
      this.$set(obj, 'loading', true)
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
              // 手动分配
              if (obj.ipPolicy === 'Manual') {
                const address = []
                freezeAllIps.forEach(ip => {
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
              } else {
                // 自动分配
                if (freezeAllIps.length < this.count) {
                  this.$message.warning('可用 IP 数量不足')
                  obj.ipPoolId = ''
                  obj.address = []
                  obj.showIps = []
                }
              }
              this.$set(obj, 'showIps', freezeAllIps.slice(0, 20))
            } else {
              this.$message.warning('可用 IP 数量不足')
              obj.address = []
              obj.showIps = []
              obj.ipPoolId = ''
              obj.portGroupId = ''
              obj.ipPolicy = 'Manual'
            }
          }
        })
        .catch(() => {
          this.$message.warning('获取 IP 失败')
          obj.address = []
          obj.showIps = []
          obj.ipPolicy = 'Auto'
        })
        .finally(() => (obj.loading = false))
    },
    getIpPool(manual) {
      if (manual) {
        // 切换资源池回显
        this.configs.networkCardConfigs.map(item => {
          item.ipPoolId = ''
        })
      }
      this.ippools = []
      this.dialog.row.networkRelations.forEach(item => {
        if (item.version == 'V4') this.ippools.push(cloneDeep(item))
      })
    },
    handleSubmit() {
      this.$refs.addData.validate(valid => {
        if (valid) {
          if (this.configs.networkCardConfigs.some(item => item.loading)) return this.$message.warning('请等待 IP 获取完成')
          if (this.configs.networkCardConfigs.some(item => item.ipPolicy === 'Manual' && !item.address?.length)) return this.$message.warning('手动模式请选择 IP')
          if (typeof this.dialog.cb === 'function') this.dialog.cb()
          this.dialog.visible = false
        }
      })
    }
  }
}
</script>
