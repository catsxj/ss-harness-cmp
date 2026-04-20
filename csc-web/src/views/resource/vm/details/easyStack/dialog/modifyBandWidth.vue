<template>
  <div>
    <el-dialog title="带宽变更" :visible.sync="addData.dialog" width="30%">
      <span>
        <el-form ref="modifyData" :model="addData.data" :status-icon="true" label-width="80px">
          <basic-form-item label="带宽:" prop="bandWidth" validate="required,number" required-message="请输入名称">
            <el-input v-model.number="addData.data.bandWidth">
              <template slot="append">Mbit/s</template>
            </el-input>
          </basic-form-item>
        </el-form>
      </span>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { patchVmId } from 'services/platform/index'
export default {
  props: {
    addData: {
      type: Object,
      default: function () {
        return {
          data: {
            id: '',
            name: ''
          },
          dialog: false
        }
      }
    }
  },
  data() {
    return {}
  },
  methods: {
    submit() {
      this.$refs.modifyData.validate(valid => {
        if (valid) {
          patchVmId('modifyBandwidth', this.addData.data).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.addData.dialog = false
              this.$parent.getData()
            }
          })
        }
      })
    }
  }
}
</script>

<style></style>
