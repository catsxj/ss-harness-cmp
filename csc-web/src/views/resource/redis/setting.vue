<template>
  <div>
    <el-dialog title="高级设置" :visible.sync="addData.dialog" width="65%">
      <el-row>
        <el-form label-width="130px" :model="addData.data" ref="data" label-position="left">
          <el-col :span="12">
            <basic-form-item label="非 TLS 端口：" prop="enableNonSslPort" validate="required">
              <el-checkbox v-model="addData.data.enableNonSslPort">启用</el-checkbox>
            </basic-form-item>
          </el-col>
          <el-col :span="12" v-if="!addData.data.enableNonSslPort">
            <basic-form-item label="TLS 版本：" prop="minimumTlsVersion" validate="required">
              <el-select v-model="addData.data.minimumTlsVersion">
                <el-option label="1.0" value="1.0"></el-option>
                <el-option label="1.1" value="1.1"></el-option>
                <el-option label="1.2" value="1.2"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="12" v-if="!addData.staticIp">
            <basic-form-item label="允许公共终结点访问：" prop="publicNetworkAccess" validate="required" label-width="180px">
              <el-checkbox v-model="addData.data.publicNetworkAccess">允许</el-checkbox>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label-width="260px" prop="maxmemoryReserved" :rules="[{ required: true, message: '该选项不能为空' }]">
              <span slot="label">
                maxmemory-reserved：
                <el-tooltip class="item" effect="dark" placement="top-start">
                  <div slot="content">为非缓存使用情况保留的以兆字节为单位的值，例如，故障转移。</div>
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-input-number v-model="addData.data.maxmemoryReserved"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label-width="330px" prop="maxfragmentationmemoryReserved" :rules="[{ required: true, message: '该选项不能为空' }]">
              <span slot="label">
                maxfragmentationmemory-reserved：
                <el-tooltip class="item" effect="dark" placement="top-start">
                  <div slot="content">为碎片保留的值(以 MB 计)</div>
                  <i class="el-icon-question"></i>
                </el-tooltip>
              </span>
              <el-input-number v-model="addData.data.maxfragmentationmemoryReserved"></el-input-number>
            </el-form-item>
          </el-col>
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
import { settingRedis } from 'services/platform/azure'
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
      loading: false
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          settingRedis({
            redis: {
              ...this.addData.data,
              publicNetworkAccess: this.addData.data.publicNetworkAccess ? 'Enabled' : 'Disabled',
              minimumTlsVersion: !this.addData.data.enableNonSslPort ? this.addData.data.minimumTlsVersion : null
            }
          }).then(data => {
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
