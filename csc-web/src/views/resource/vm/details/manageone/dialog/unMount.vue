<template>
  <div>
    <el-dialog title="卸载网卡" append-to-body :visible.sync="addData.dialog" width="40%">
      <span>
        <el-form ref="unMountData" :model="addData.data" :status-icon="true" label-width="80px">
          <basic-form-item label="名称" prop="portId" :rules="[required]" required-message="该字段为必填字段">
            <el-select v-model="addData.data.portId">
              <el-option v-for="item in unMountList" :key="item.id" :label="item.ipAddress + '(' + item.networkName + ')'" :value="item.id"></el-option>
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
import { vmDeleteNetwork, getVmPorts } from 'services/platform/index'
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
      unMountList: []
    }
  },
  methods: {
    ok() {
      this.$refs.unMountData.validate(valid => {
        if (valid) {
          const obj = {
            id: this.addData.data.id,
            portId: this.addData.data.portId,
            vendorId: this.addData.data.vendorId
          }
          vmDeleteNetwork(obj).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
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
        vendorId: this.addData.data.vendorId
      })
    }).then(data => {
      if (data.success) {
        this.unMountList = data.data
      }
    })
  }
}
</script>

<style></style>
