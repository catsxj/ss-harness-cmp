<template>
  <div>
    <el-dialog title="设置监控IP" :visible.sync="addData.dialog" width="40%">
      <span>
        <el-form ref="setData" :model="addData.data" :status-icon="true" label-width="120px">
          <basic-form-item label="IP地址：" prop="ip" validate="required" required-message="该字段为必填字段">
            <el-select clearable v-model="addData.data.ip">
              <el-option v-for="(item, index) in ipData" :key="index" :label="item" :value="item"></el-option>
            </el-select>
          </basic-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { setIps } from 'services/monitor/index'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            ip: ''
          },
          dialog: false
        }
      }
    },
    ipData: {
      type: Array
    }
  },
  data() {
    return {}
  },
  methods: {
    ok() {
      this.$refs.setData.validate(valid => {
        if (valid) {
          setIps(this.addData.data).then(data => {
            if (data.success) {
              this.$message({
                type: 'success',
                message: data.message
              })
              this.addData.dialog = false
            }
          })
        }
      })
    }
  },
  created() {}
}
</script>

<style></style>
