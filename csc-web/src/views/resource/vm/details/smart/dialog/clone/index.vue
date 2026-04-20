<template>
  <div>
    <el-dialog title="克隆" append-to-body :visible.sync="addData.dialog" width="60%" v-if="addData.dialog">
      <div>
        <basic-form ref="data" :model="addData.data" :status-icon="true" label-width="110px">
          <el-row>
            <el-col :span="16">
              <basic-form-item label="云主机名称：" prop="name" validate="required">
                <el-input v-model="addData.data.name" auto-complete="off"></el-input>
              </basic-form-item>
              <basic-form-item label="克隆数量：" prop="count" validate="required">
                <el-input-number v-model="addData.data.count" :min="1" :max="10" style="width: 100%"></el-input-number>
              </basic-form-item>
              <basic-form-item label="主机名称：" prop="vmHostName" validate="noChinese">
                <el-input v-model="addData.data.vmHostName" auto-complete="off"></el-input>
              </basic-form-item>
              <basic-form-item label="数据中心：" required>
                <el-select v-model="addData.data.vdcId" @change="chooseVdc" filterable>
                  <el-option :key="index" v-for="(item, index) in vdcData" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </basic-form-item>
              <basic-form-item label="主机集群：">
                <el-radio-group v-model="addData.data.clusterId" @change="chooseCluster">
                  <el-radio :label="item.id" :key="index" v-for="(item, index) in clusterData" border> {{ item.name }} </el-radio>
                </el-radio-group>
              </basic-form-item>
              <basic-form-item label="目标主机：" prop="hostId" validate="required">
                <el-select v-model="addData.data.hostId" @change="chooseVhost" filterable>
                  <el-option :disabled="!item.connected || item.maintained" :key="index" v-for="(item, index) in vhostData" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </basic-form-item>
              <basic-form-item label="数据存储：" prop="storeId" validate="required">
                <el-select v-model="addData.data.storeId" @change="chooseDatastore" filterable>
                  <el-option :key="index" v-for="(item, index) in datastoreData" :label="item.name + '-' + item.value + 'G'" :value="item.id"></el-option>
                </el-select>
              </basic-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="网络设备：">
                <div class="boxLine">
                  <div class="control-input">
                    <div class="region region-box region-active vm-network-region" v-for="(row, index) in selectNetworkListData" :key="index">
                      <span class="region-txt" :class="{ REMOVE: 'line-through' }[row.operation]">{{ row.disLabel + ' ' + row.name }}</span>
                      <span class="text-warning-dk" v-if="row.operation != 'NORMAL'">({{ row.operation }})</span>
                      <span style="cursor: pointer">
                        <i class="el-icon-edit" @click="operateNetwork(row, index)"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <basic-form-item label="加入堡垒机：" prop="isAddShterm">
                <el-switch v-model="addData.data.isAddShterm" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
              </basic-form-item>
              <basic-form-item label="云主机描述：" prop="remark">
                <el-input type="textarea" v-model="addData.data.remark" auto-complete="off"></el-input>
              </basic-form-item>
            </el-col>
          </el-row>
        </basic-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </div>
    </el-dialog>
    <add @back="addSubmit" :add-data="addNetworkCard" :parent-data="addData.data" v-if="addNetworkCard.dialog" :list="selectNetworkListData"></add>
  </div>
</template>

<script>
/* global $ */
import { getHost, getVdc, getCluters, getDatastores, patchVmId, detailVm } from 'services/platform/index'
import add from './add.vue'
export default {
  components: { add },
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            storeId: '',
            hostId: ''
          },
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      vmHostList: [],
      radio: 'a',
      selectNetworkListData: [],
      vdcData: [],
      vhostData: [],
      clusterData: [],
      datastoreData: [],
      addNetworkCard: {
        dialog: false,
        data: {}
      }
    }
  },
  methods: {
    formatNetworks() {
      const toObjFormat = function (obj) {
        for (const a in obj) {
          if (obj[a] === '') delete obj[a]
        }
        return obj
      }
      const arr = []
      this.selectNetworkListData.forEach(item => {
        const obj = toObjFormat({
          name: item.name,
          type: item.type,
          portType: item.portType,
          mac: item.mac,
          label: item.label,
          operation: item.operation,
          ipId: item.ipId,
          address: item.address,
          ciscoSubnetId: item.ciscoSubnetId,
          disLabel: item.disLabel,
          ipv6Enabled: item.ipv6Enabled,
          ipv6Address: item.ipv6Address,
          ipv4PoolId: item.ipv4PoolId,
          ipv6PoolId: item.ipv6PoolId
        })
        if (item.type == undefined) {
          delete item.type
        }
        arr.push(obj)
      })
      return arr
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.addData.data.operations = this.formatNetworks()
          let countFlag = false
          this.addData.data.operations.forEach(item => {
            if (item.address && item.address.length != 0 && item.address.length != this.addData.data.count) {
              countFlag = true
            }
            if (item.ipv6Address && item.ipv6Address.length != 0 && item.ipv6Address.length != this.addData.data.count) {
              countFlag = true
            }
          })
          if (countFlag) return this.$message.error('网络设备指定IP不满足批量申请云主机所需数量，请重新配置网络设备IP')
          patchVmId('clone', this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$parent.handleSearch()
            }
          })
        }
      })
    },
    // 选择目标主机
    chooseVhost(item) {
      this.vhostData.forEach(data => {
        if (data.id == this.addData.data.hostId) {
          this.addData.data.hostname = data.name
          this.addData.data.datastore = ''
          this.datastoreData = ''
          this.getDatastore(data.id)
        }
      })
    },
    // 获取数据存储数据
    getDatastore(vhostId) {
      const params = {
          simple: true
        },
        searchParam = [
          { param: { vhostId: vhostId, category: 'PM' }, sign: 'EQ' },
          {
            param: { status: 'inactive' },
            sign: 'UEQ'
          }
        ]
      params.params = JSON.stringify(searchParam)
      getDatastores(params).then(data => {
        if (data.success) {
          data.data.rows.forEach(item => {
            item.isDatastoreActive = false
          })
          this.datastoreData = data.data.rows
        }
      })
    },
    // 选择集群
    chooseCluster(item) {
      this.addData.data.hostname = ''
      this.addData.data.datastore = ''
      this.datastoreData = []
      this.getVhost(this.addData.data.clusterId, 'cluster')
    },
    // 选择数据存储
    chooseDatastore(item) {
      this.datastoreData.forEach(data => {
        if (data.id == this.addData.data.storeId) {
          this.addData.data.datastore = data.name
        }
      })
    },
    getVdc() {
      const params = {
          simple: true
        },
        searchParam = [{ param: { vendorId: this.addData.data.vendorId }, sign: 'EQ' }]
      params.params = JSON.stringify(searchParam)
      getVdc(params).then(data => {
        if (data.success) {
          this.vdcData = data.data.rows
        }
      })
    },
    // 选择数据中心
    chooseVdc() {
      this.addData.data.clusterId = ''
      this.addData.data.hostname = ''
      this.addData.data.datastore = ''
      this.datastoreData = []
      this.getCluster()
      this.getVhost(this.addData.data.vdcId, 'vdc')
    },
    // 获取集群数据
    getCluster() {
      const params = {
          simple: true
        },
        searchParam = [{ param: { vendorId: this.addData.data.vendorId, vdcId: this.addData.data.vdcId }, sign: 'EQ' }]
      params.params = JSON.stringify(searchParam)
      getCluters(params).then(data => {
        if (data.success) {
          this.clusterData = data.data.rows
        }
      })
    },
    // 获取目标主机数据
    getVhost(id, type) {
      let searchParam = []
      if (type == 'vdc') {
        searchParam = [{ param: { vdcId: id }, sign: 'EQ' }]
      } else if (type == 'cluster') {
        searchParam = [{ param: { clusterId: id }, sign: 'EQ' }]
      }
      const params = {
        page: 1,
        rows: 10000,
        type: 'Vmware'
      }
      params.params = JSON.stringify(searchParam)
      getHost(params).then(data => {
        if (data.success) {
          this.vhostData = data.data.rows
        }
      })
    },
    operateNetwork(row, index) {
      this.indexNet = index
      const itemData = JSON.parse(JSON.stringify(row))
      itemData.operation = 'EDIT'
      this.addNetworkCard = {
        dialog: true,
        title: '编辑网络设备',
        index: index,
        data: itemData
      }
    },
    addSubmit(data) {
      if (this.addNetworkCard.title == '编辑网络设备') {
        this.selectNetworkListData[this.indexNet] = data
      } else {
        this.selectNetworkListData.push(data)
      }
    }
  },
  created() {
    detailVm(this.addData.data.id).then(data => {
      if (data.success) {
        const host = data.data
        this.selectNetworkListData = host.netcards
        this.selectNetworkListData.forEach(function (item) {
          item.operation = 'NORMAL'
          item.cacheOperation = 'NORMAL'
          item.disLabel = item.label.replace(/Network adapter/g, '网络适配器')
        })
        this.getVdc()
        this.$set(this.addData.data, 'vdcId', host.vdcId)
        this.chooseVdc()
      }
    })
  }
}
</script>

<style></style>
