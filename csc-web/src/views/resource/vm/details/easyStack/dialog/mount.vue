<template>
  <div>
    <el-dialog title="挂载网卡" append-to-body :visible.sync="addData.dialog" width="60%">
      <span>
        <el-form ref="data" :model="addData.data" :status-icon="true" label-width="120px">
          <el-form-item label="网卡：">
            <set-network :network-list="ipList" ref="network" type="mount"></set-network>
          </el-form-item>
          <!-- <basic-form-item label="QoS策略：" prop="policyId">
            <el-select v-model="addData.data.policyId">
              <el-option v-for="(item, index) in policyData" :key="index" :label="item.name + '_' + item.maxKbps + 'Mbit/s'" :value="item.id"></el-option>
            </el-select>
          </basic-form-item> -->
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { conditionNetwork, vmAttachNetowrk, conditionQosPolicy } from 'services/platform/index'
import setNetwork from './setnetwork/index.vue'
export default {
  components: { setNetwork },
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            labelIds: []
          },
          dialog: false
        }
      }
    },
    vendorId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      ipList: [],
      policyData: [],
      loading: false
    }
  },
  methods: {
    conditionQosPolicy() {
      conditionQosPolicy({
        condition: JSON.stringify({
          condition: 'listPolicysByVm',
          vendorId: this.addData.data.vendorId
        })
      }).then(data => {
        if (data.success) {
          this.policyData = data.data
        }
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const objs = {
            id: this.addData.data.id,
            networks: [],
            vendorId: this.addData.data.vendorId,
            policyId: this.addData.data.policyId
          }
          const networkList = this.$refs.network.ok()
          const idList = []
          networkList.forEach(item => {
            if (idList.indexOf(item.id) == -1) {
              const obj = {
                networkId: item.id,
                networkName: item.networkName,
                addresses: []
              }
              const listObj = {
                networkId: item.id,
                subnetId: item.subnetId,
                subnetName: item.subnetName,
                address: item.ip
              }
              obj.addresses.push(listObj)
              idList.push(item.id)
              objs.networks.push(obj)
            } else {
              objs.networks.forEach(item1 => {
                if (item1.networkId == item.id) {
                  item1.addresses.push({
                    networkId: item.id,
                    subnetId: item.subnetId,
                    subnetName: item.subnetName,
                    address: item.ip
                  })
                }
              })
            }
          })
          if (objs.networks.length == 0) return this.$message.error('请选择网卡')
          this.loading = true
          vmAttachNetowrk(objs).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
            }
            this.loading = false
          })
        }
      })
    }
  },
  created() {
    conditionNetwork({
      condition: 'listNetAndSubNet',
      vendorId: this.addData.data.vendorId,
      tenantUuid: this.addData.tenantUuid
    }).then(data => {
      if (data.success) {
        this.ipList = data.data
      }
    })
    // this.conditionQosPolicy()
  }
}
</script>

<style scoped>
.btn-checkbox:hover {
  background-color: #5ac1f5;
  color: #fff;
}

.btn {
  border: 1px solid #5ac1f5;
  color: #5ac1f5;
  margin-bottom: 5px;
  padding: 5px;
  cursor: pointer;
  border-radius: 5px;
}

.btn-ok {
  background: #5ac1f5 !important;
  color: #fff !important;
}

.ip-input {
  font-size: 14px;
  line-height: 1.42857143;
  color: #555;
  background-color: #fff;
  background-image: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  -webkit-transition: border-color ease-in-out 0.15s, -webkit-box-shadow ease-in-out 0.15s;
  -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
}
</style>
