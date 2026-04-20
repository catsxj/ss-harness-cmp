<template>
  <!-- 从管理端那里复制过来后修改的 -->
  <el-dialog append-to-body :title="addData.title" :visible.sync="addData.dialog" width="60%" v-if="addData.dialog">
    <basic-form ref="data" :model="addData.data" :status-icon="true" label-width="120px">
      <basic-form-item label="连接到：" prop="bvsId" validate="required">
        <el-select v-model="addData.data.bvsId" @change="bridgeChange">
          <el-option v-for="item in bridgeList" :key="item.networkUuid" :value="item.networkUuid" :label="item.name"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="端口组：" prop="portUuid" validate="required" v-if="portList.length > 0">
        <el-select v-model="addData.data.portUuid">
          <el-option v-for="item in portList" :key="item.id" :value="item.uuid" :label="item.name"></el-option>
        </el-select>
      </basic-form-item>
      <basic-form-item label="MAC地址：" prop="mac">
        <el-input v-model="addData.data.mac" disabled>
          <el-button slot="append" icon="el-icon-refresh" @click="getMacData"></el-button>
        </el-input>
      </basic-form-item>
      <basic-form-item label="IP地址：" prop="ip" validate="required,ip">
        <el-input v-model="addData.data.ip" placeholder="请输入IPv4地址，如192.168.1.1"> </el-input>
      </basic-form-item>
      <basic-form-item label="子网掩码：" prop="mask" validate="required,mask">
        <el-input placeholder="请输入子网掩码，如255.255.255.0" v-model="addData.data.mask"></el-input>
      </basic-form-item>
      <basic-form-item label="网关：" prop="gateway" validate="required,ip">
        <el-input placeholder="选填，如1.1.1.1" v-model="addData.data.gateway"></el-input>
      </basic-form-item>
    </basic-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
      <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { modifyVm, getNetwork, getMac } from 'services/platform/index'
import { cloneDeep } from 'lodash-es'
export default {
  props: {
    addData: {
      type: Object
    }
  },
  data() {
    return {
      bridgeList: [],
      portList: [],
      loading: false
    }
  },
  created() {
    this.getMacData()
    this.getBridgeList()
  },
  methods: {
    async getMacData() {
      const { data } = await getMac({ vendorId: this.addData.vendorId })
      this.addData.data.mac = data
    },
    bridgeChange() {
      this.portList = []
      this.addData.data.portUuid = ''
      const { vlanGroups, bridgeInfos, name } = this.bridgeList.find(item => item.networkUuid === this.addData.data.bvsId)
      this.addData.data.bridgename = name
      this.portList = vlanGroups || bridgeInfos
      this.addData.data.portUuid = vlanGroups[0]?.uuid
    },
    async getBridgeList() {
      const {
        data: { rows }
      } = await getNetwork({ page: 1, rows: 9999, params: this.$tools.handleSearchParam({ vendorId: this.addData.vendorId, vendorType: 'sangfor', azId: this.addData.azId }) })
      this.bridgeList = rows
      const [{ networkUuid, type, vlanGroups, bridgeInfos }] = rows
      this.addData.data.bvsId = networkUuid
      this.bridgeChange()
      if (type === 'bvs' || vlanGroups.length || bridgeInfos.length) {
        this.portList = vlanGroups || bridgeInfos
        this.addData.data.portUuid = vlanGroups[0].uuid || bridgeInfos[0].uuid
      }
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const data = cloneDeep(this.addData)
          data.sangforNetworks = data.sangforNetworks.map(item => {
            return {
              // 已存在的网卡
              bridgename: item.name, // 虚机网卡参数的name
              bvsId: item.deviceId, // 虚机网卡参数的deviceId
              gateway: item.gateway, // 虚机网卡参数的gateway
              ip: item.ipAddress, // 虚机网卡参数的ip_address
              mac: item.macAddress, // 虚机网卡参数的mac_address
              mask: item.mask, // 虚机网卡参数的mask，没有就传空
              portUuid: item.portId, // 虚机网卡参数的port_id
              vifId: item.vifId, // 虚机网卡参数的vif_id
              model: item.model || 'virtio' // 虚机网卡参数的model，没有就传空
            }
          })
          // 新增网卡
          data.data.vifId = 'net' + data.sangforNetworks.length
          data.sangforNetworks.push(data.data)
          this.loading = true
          modifyVm(data)
            .then(data => {
              if (data.success) {
                this.$message.success(data.message)
                this.addData.dialog = false
              }
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>
