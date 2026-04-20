<template>
  <div>
    <el-dialog title="更改层" :visible.sync="addData.dialog" width="40%" append-to-body>
      <el-row>
        <el-form label-width="130px" :model="addData.data" ref="data">
          <el-col :span="24">
            <basic-form-item label="访问层：" prop="standardBlobTier" validate="required">
              <el-select v-model="addData.data.standardBlobTier">
                <el-option label="热（推断）" value="HOT"></el-option>
                <el-option label="冷" value="COOL"></el-option>
                <el-option label="存档" value="ARCHIVE"></el-option>
              </el-select>
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
import { patchBolbTier } from 'services/platform/azure'
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
          patchBolbTier(this.addData.data).then(data => {
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
