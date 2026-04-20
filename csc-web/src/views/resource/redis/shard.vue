<template>
  <div>
    <el-dialog title="群集大小" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-form label-width="130px" :model="addData.data" ref="data">
          <basic-form-item label="分片计数：" label-width="120px" prop="shardCount" validate="required">
            <el-slider v-model="addData.data.shardCount" :step="1" :min="1" :max="10" show-input show-stops> </el-slider>
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
import { putRedis } from 'services/platform/azure'
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
          putRedis('cluster', this.addData.data).then(data => {
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
