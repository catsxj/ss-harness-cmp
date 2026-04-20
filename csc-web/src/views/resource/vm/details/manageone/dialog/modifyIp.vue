<template>
  <div>
    <el-dialog title="修改IP" append-to-body :visible.sync="addData.dialog" width="40%">
      <span>
        <basic-form ref="data" :model="addData.data" :status-icon="true" label-width="100px">
          <basic-form-item label="名称：" prop="id" :rules="[required]" required-message="该字段为必填字段">
            <el-select v-model="addData.data.id" @change="setOldIpAddress">
              <el-option v-for="item in unMountList" :key="item.id" :label="item.ipAddress + '(' + item.networkName + ')'" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
          <basic-form-item label="IP：" prop="ipAddress" :rules="[required, ip]">
            <el-input v-model="addData.data.ipAddress"></el-input>
          </basic-form-item>
        </basic-form>
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
import { modifyPort, getVmPorts } from 'services/platform/index'
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
      loading: false,
      unMountList: []
    }
  },
  methods: {
    setOldIpAddress() {
      this.unMountList.forEach(item => {
        if (item.id == this.addData.data.id) this.addData.data.oldIpAddress = item.ipAddress
      })
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          modifyPort(this.addData.data).then(data => {
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
    getVmPorts(this.addData.data.vmId, {
      action: 'listByVmId',
      params: JSON.stringify({
        id: this.addData.data.vmId,
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
