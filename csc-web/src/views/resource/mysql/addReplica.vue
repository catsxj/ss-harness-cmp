<template>
  <div>
    <el-dialog title="添加从属实例" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="120px" :model="addData.data" ref="data">
          <basic-form-item label="名称：" prop="name" validate="required">
            <el-input v-model="addData.data.name"> </el-input>
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
import { applyResource } from 'services/services/product'
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
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const data = this.addData.data
          const params = {
            location: {
              region: data.regionId,
              az: data.regionId,
              vendorId: data.vendorId
            },
            emption: {
              duration: {
                mode: 'HOUR'
              },
              count: 1
            },
            configs: {
              vendorId: data.vendorId,
              masterServerId: data.id,
              resourceGroupId: data.resourceGroupId,
              name: data.name,
              createMode: 'Replica',
              regionId: data.regionId,
              availablitiyZone: data.regionId
            },
            elements: [
              {
                serviceCode: 'azure.database.mysql'
              }
            ],
            sla: null,
            service: 'azure.database.mysql'
          }
          this.loading = true
          applyResource(params).then(data => {
            this.loading = false
            if (data.success) {
              this.$message.success(data.message)
              this.addData.dialog = false
            }
          })
        }
      })
    }
  }
}
</script>

<style></style>
