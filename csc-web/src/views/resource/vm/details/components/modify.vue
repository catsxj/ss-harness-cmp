<template>
  <div>
    <el-dialog title="编辑云主机" :visible.sync="addData.dialog" width="30%">
      <span>
        <el-form ref="modifyData" :model="addData.data" :status-icon="true" label-width="80px">
          <basic-form-item label="名称" prop="name" validate="required" required-message="请输入名称">
            <el-input v-model="addData.data.name"></el-input>
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
import { modifyVm, detailVm } from 'services/platform/index'
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
          modifyVm(this.addData.data).then(data => {
            if (data.success) {
              this.$message.success(data.message)
              this.addData.dialog = false
              this.$parent.getData()
            }
          })
        }
      })
    },
    getDetail() {
      detailVm(this.addData.data.id).then(data => {
        if (data.success) {
          this.addData.data.name = data.data.name
        }
      })
    }
  },
  created() {
    this.getDetail()
  }
}
</script>

<style></style>
