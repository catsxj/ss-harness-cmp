<template>
  <div>
    <el-dialog title="新增挂载网卡" :visible.sync="addData.dialog" width="40%" append-to-body>
      <el-row>
        <el-form label-width="90px" :model="addData.data" ref="data">
          <basic-form-item label="名称：" prop="name" :rules="[required]">
            <el-input v-model="addData.data.name"></el-input>
          </basic-form-item>
          <basic-form-item label="子网：" prop="subnetId" :rules="[required]">
            <el-select v-model="addData.data.subnetId">
              <el-option v-for="(item, index) in subnetList" :key="index" :label="item.name + '(' + item.cidr + ')'" :value="item.id"></el-option>
            </el-select>
          </basic-form-item>
          <el-form-item prop="primaryPrivateIPAddress" :rules="rules">
            <span slot="label">
              专用IP：
              <el-tooltip class="item" effect="dark" placement="top-start">
                <div slot="content">若不指定IP，则自动分配</div>
                <i class="el-icon-question"></i>
              </el-tooltip>
            </span>
            <el-input v-model="addData.data.primaryPrivateIPAddress"></el-input>
          </el-form-item>
          <basic-form-item label="描述：" prop="remark">
            <el-input type="textarea" v-model="addData.data.remark"></el-input>
          </basic-form-item>
        </el-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { getSubnet } from 'services/platform/index'
import { createVmNics } from 'services/platform/azure'
var validate = (rule, value, callback) => {
  const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
  if (reg.test(value) || !value) {
    callback()
  } else {
    callback(new Error('请输入正确的IP地址'))
  }
}
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
    }
  },
  data() {
    return {
      resourceData: [],
      regionList: [],
      subnetList: [],
      networkList: [],
      loading: false,
      rules: [{ validator: validate }]
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          createVmNics({
            vendorId: this.addData.data.vendorId,
            serverId: this.addData.data.serverId,
            nics: this.addData.data
          }).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
            }
            this.loading = true
          })
        }
      })
    },
    getSubnet() {
      getSubnet({
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId, networkId: this.addData.networkId }, sign: 'EQ' }])
      }).then(data => {
        if (this.addData.data.subnetId) this.$set(this.addData.data, 'subnetId', '')
        this.subnetList = data.data.rows
      })
    }
  },
  created() {
    this.getSubnet()
  }
}
</script>

<style></style>
