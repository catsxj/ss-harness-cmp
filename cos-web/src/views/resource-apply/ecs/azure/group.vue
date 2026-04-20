<template>
  <div>
    <el-dialog title="新增资源组" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="90px" :model="addData.data" ref="data">
          <vendor :add-data="addData.data" :types="['OPENSTACK', 'MANAGEONE', 'TCE', 'ALIYUN']"></vendor>
          <cmp-form-item label="名称" prop="name" validate="required">
            <el-input v-model="addData.data.name"></el-input>
          </cmp-form-item>
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
import { createResource } from 'services/platform/azure'
import { getRegion } from 'services/platform/index'
import vendor from './setVendor/index.vue'

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
      loading: false
    }
  },
  created() {},
  methods: {
    ok() {
      this.$refs.data.validate((valid) => {
        if (valid) {
          this.loading = true
          createResource(this.addData.data).then((data) => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.$emit('back')
              this.addData.dialog = false
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
