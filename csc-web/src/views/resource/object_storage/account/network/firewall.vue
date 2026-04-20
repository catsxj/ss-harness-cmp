<template>
  <div>
    <el-dialog title="附加防火墙IP" :visible.sync="addData.dialog" width="50%" v-if="addData.dialog" append-to-body>
      <basic-form ref="data" :model="addData.data" :status-icon="true" label-width="120px">
        <el-alert class="m-b" type="warning" show-icon :closable="false" description="IP 规则仅支持公共 IP 地址。"></el-alert>
        <basic-form-item label="类型：" prop="ipType" validate="required">
          <el-radio-group v-model="addData.data.ipType" size="small" @change="handleIpType">
            <el-radio label="IP" border>IP地址</el-radio>
            <el-radio label="IPRANGE" border>地址范围</el-radio>
          </el-radio-group>
        </basic-form-item>
        <basic-form-item label="IP地址：" prop="ipAddresses" validate="required,ip" v-if="addData.data.ipType == 'IP'" key="ip">
          <el-input v-model="addData.data.ipAddresses"></el-input>
        </basic-form-item>
        <basic-form-item label="地址范围" prop="ipAddresses" validate="required,cidr" v-else key="iprange">
          <el-input v-model="addData.data.ipAddresses"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addAccountFirewallIp } from 'services/platform/azure'
/* global $ */
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {},
          dialog: false
        }
      }
    }
  },
  data() {
    return {
      loading: false
    }
  },
  created() {},
  methods: {
    handleIpType() {
      this.$set(this.addData.data, 'ipAddresses', '')
    },
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          addAccountFirewallIp(this.addData.data).then(data => {
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
  }
}
</script>

<style></style>
