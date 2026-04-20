<template>
  <div>
    <el-dialog :title="title[addData.type]" :visible.sync="addData.dialog" width="50%">
      <el-alert v-if="addData.type == 'key'" :closable="false" title="创建成功以后将自动下载私钥，该密钥仅有一次下载机会，请保存好下载的私钥。" type="warning"> </el-alert>
      <el-form label-width="100px" :model="addData.data" ref="data" class="m-t-md">
        <cmp-form-item label="名称：" prop="name" validate="required" required-message="请输入名称">
          <el-input v-model="addData.data.name"></el-input>
        </cmp-form-item>
        <el-form-item v-if="addData.type == 'set'">
          <span slot="label">
            容错域：
            <el-tooltip class="item" effect="dark" placement="top-start">
              <div slot="content">同一容错域中的云主机共享一个通用电源和物理网络开关。</div>
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-slider @change="setGx" v-model="addData.data.faultDomainCount" :min="1" :max="2" show-input> </el-slider>
        </el-form-item>
        <el-form-item v-if="addData.type == 'set'">
          <span slot="label">
            更新域：
            <el-tooltip class="item" effect="dark" placement="top-start">
              <div slot="content">同一更新域中的云主机将在计划内维护期间同时重启。金山云 从不同时重启多个更新域。</div>
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-slider v-model="addData.data.updateDomainCount" :min="1" :max="addData.data.faultDomainCount == 1 ? 1 : 20" show-input> </el-slider>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { createGroup, createKey } from 'services/platform/index'
import { createSet } from 'services/platform/azure'
import { downloadFile } from 'utils'
/* global $ */
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
      title: {
        group: '新增安全组',
        key: '新增密钥',
        set: '新增可用性集'
      },
      loading: false
    }
  },
  created() {},
  methods: {
    setGx() {
      if (this.addData.data.faultDomainCount == 1) this.$set(this.addData.data, 'updateDomainCount', 1)
    },
    ok() {
      this.$refs.data.validate((valid) => {
        if (valid) {
          this.loading = true
          if (this.addData.type == 'group') {
            createGroup({
              name: this.addData.data.name,
              regionId: this.addData.data.regionId,
              resourceGroupId: this.addData.data.resourceGroupId,
              vendorId: this.addData.data.vendorId
            }).then((data) => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.addData.dialog = false
                this.$emit('backGroup')
              }
              this.loading = false
            })
          } else if (this.addData.type == 'set') {
            createSet({
              availabilitySet: this.addData.data
            }).then((data) => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.addData.dialog = false
                this.$emit('backSet')
              }
              this.loading = false
            })
          } else {
            createKey({
              name: this.addData.data.name,
              regionId: this.addData.data.regionId,
              resourceGroupId: this.addData.data.resourceGroupId,
              vendorId: this.addData.data.vendorId
            }).then((data) => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.addData.dialog = false
                this.$emit('backKey')
                downloadFile('/ims/v1/keypairs/download', {
                  id: data.data
                })
              }
              this.loading = false
            })
          }
        }
      })
    }
  }
}
</script>

<style></style>
