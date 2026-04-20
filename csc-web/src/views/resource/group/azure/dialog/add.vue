<template>
  <div>
    <el-dialog :title="addData.title" :visible.sync="addData.dialog" width="40%">
      <el-form label-width="100px" :model="addData.data" ref="data">
        <vendor :add-data="addData" v-if="addData.title == '新增安全组'" @vendorId="getResource"></vendor>
        <basic-form-item label="名称：" prop="name" validate="required" required-message="请输入名称">
          <el-input v-model="addData.data.name"></el-input>
        </basic-form-item>
        <basic-form-item label="资源组" prop="resourceGroupId" validate="required" required-message="该字段为必填字段">
          <el-select v-model="addData.data.resourceGroupId">
            <el-option v-for="item in resourceData" :label="item.name" :value="item.id" :key="item.id"></el-option>
          </el-select>
        </basic-form-item>
        <basic-form-item label="备注：" prop="remark">
          <el-input type="textarea" v-model="addData.data.remark" :maxlength="256"></el-input>
        </basic-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import vendor from '@/components/publicPool/index.vue'
import { modifyGroup, createGroup, conditionCloudVendor } from 'services/platform/index'
import { getResource } from 'services/platform/azure'
export default {
  components: {
    vendor
  },
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
      loading: false
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const obj = Object.assign({}, this.addData.data)
          this.loading = true
          if (this.addData.data.id) {
            modifyGroup(obj).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.addData.dialog = false
                this.$emit('getData')
              }
              this.loading = false
            })
          } else {
            createGroup(obj).then(data => {
              if (data.success) {
                this.$message({
                  type: 'success',
                  message: data.message
                })
                this.addData.dialog = false
                this.$emit('getData')
              }
              this.loading = false
            })
          }
        }
      })
    },
    getResource() {
      const params = {
        page: 1,
        rows: 9999,
        params: JSON.stringify([{ param: { vendorId: this.addData.data.vendorId }, sign: 'EQ' }])
      }
      getResource(params).then(data => {
        if (data.success) {
          if (this.addData.data.resourceGroupId) this.addData.data.resourceGroupId = ''
          this.resourceData = data.data.rows
        }
      })
    }
  },
  created() {}
}
</script>

<style></style>
