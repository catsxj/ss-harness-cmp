<template>
  <div>
    <el-dialog append-to-body title="修改IP配置" :visible.sync="addData.dialog" v-if="addData.dialog">
      <cmp-form ref="data" :model="addData.data" :status-icon="true" label-width="100px">
        <cmp-form-item label="分配：" prop="ipMethod" validate="required">
          <el-radio-group v-model="addData.data.ipMethod" size="small">
            <el-radio label="Dynamic" border>动态</el-radio>
            <el-radio label="Static" border>静态</el-radio>
          </el-radio-group>
        </cmp-form-item>
        <cmp-form-item label="公共IP：" prop="privateIpAddress" v-if="addData.data.ipMethod == 'Static'" validate="required,ip">
          <el-input v-model="addData.data.privateIpAddress"></el-input>
        </cmp-form-item>
      </cmp-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok" :loading="loading">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { modifyNicsIp } from 'services/platform/azure'
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
  components: {},
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
          const params = {
            id: this.addData.data.id,
            ipMethod: this.addData.data.ipMethod
          }
          if (this.addData.data.ipMethod == 'Static') {
            params.privateIpAddress = this.addData.data.privateIpAddress
          }
          modifyNicsIp(params).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
              this.$emit('back')
              this.$parent.handleSearch()
            }
            this.loading = true
          })
        }
      })
    }
  },
  created() {}
}
</script>

<style></style>
