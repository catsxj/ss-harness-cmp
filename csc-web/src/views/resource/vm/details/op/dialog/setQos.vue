<template>
  <div>
    <el-dialog title="设置QoS" append-to-body :visible.sync="addData.dialog" width="40%">
      <span>
        <el-form ref="unMountData" :model="addData.data" :status-icon="true" label-width="120px">
          <basic-form-item label="网卡：" prop="portId" validate="required" required-message="该字段为必填字段">
            <el-select v-model="addData.data.portId">
              <el-option v-for="(item, index) in list" :key="index" :label="item.ipAddress + (item.maxKbps ? '(当前带宽：' + item.maxKbps + 'Mbit/s)' : '')" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="QoS策略：" prop="policyId" validate="required" required-message="该字段为必填字段">
            <el-select v-model="addData.data.policyId">
              <el-option v-for="(item, index) in policyData" :key="index" :label="item.name + '_' + item.maxKbps + 'Mbit/s'" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { vmDeleteNetworkQos, getVmPorts, conditionQosPolicy } from 'services/platform/index'
export default {
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
      list: [],
      policyData: []
    }
  },
  methods: {
    ok() {
      this.$refs.unMountData.validate(valid => {
        if (valid) {
          vmDeleteNetworkQos(this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$parent.getData()
            }
          })
        }
      })
    }
  },
  created() {
    getVmPorts(this.addData.data.id, {
      action: 'listByVmId',
      params: JSON.stringify({
        id: this.addData.data.id,
        vendorId: this.vendorId
      })
    }).then(data => {
      if (data.success) {
        this.list = data.data
      }
    })
    conditionQosPolicy({
      condition: JSON.stringify({
        condition: 'listPolicysByVm',
        vendorId: this.addData.data.vendorId,
        tenantUuid: this.addData.tenantUuid
      })
    }).then(data => {
      if (data.success) {
        this.policyData = data.data
      }
    })
  }
}
</script>

<style></style>
