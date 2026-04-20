<template>
  <div>
    <el-dialog title="新增密钥" :visible.sync="addData.dialog" width="50%">
      <el-row>
        <el-alert :closable="false" title="创建成功以后将自动下载私钥，请保存好下载的私钥，后续将无法再次下载该私钥" type="warning"> </el-alert>
        <el-form class="m-t-md" label-width="120px" :model="addData.data" ref="data">
          <vendor :add-data="addData" @vendorId="getResource"></vendor>
          <el-col :span="24">
            <basic-form-item label="资源组：" prop="resourceGroupId" validate="required" required-message="该字段为必填字段">
              <el-select v-model="addData.data.resourceGroupId">
                <el-option v-for="item in resourceData" :label="item.name" :value="item.id" :key="item.id"></el-option>
              </el-select>
            </basic-form-item>
          </el-col>
          <el-col :span="24">
            <basic-form-item label="名称：" prop="name" validate="required" required-message="请输入名称">
              <el-input v-model="addData.data.name"></el-input>
            </basic-form-item>
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
import { getRegion, createKey } from 'services/platform/index'
import { getResource } from 'services/platform/azure'
import vendor from '@/components/publicPool/index.vue'
import { downloadFile } from 'utils'

export default {
  components: { vendor },
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
      regionList: [],
      resourceData: [],
      loading: false
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          this.loading = true
          createKey(this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
              downloadFile('/ims/v1/keypairs/download', {
                id: data.data
              })
            }
            this.loading = false
          })
        }
      })
    },
    getResource() {
      if (this.addData.data.resourceGroupId) this.addData.data.resourceGroupId = ''
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId }, sign: 'EQ' }])
      }
      getResource(params).then(data => {
        if (data.success) {
          this.resourceData = data.data.rows
        }
      })
    }
  }
}
</script>

<style></style>
