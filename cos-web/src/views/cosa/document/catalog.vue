<template>
  <div>
    <el-dialog title="新增子节点" width="40%" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
      <el-form :model="addData.data" :rules="rules" status-icon ref="data" label-width="100px" class="demo-ruleForm">
        <el-form-item label="名称：" prop="name">
          <el-input v-model="addData.data.name"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addData.dialog = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { createDocument } from 'services/system/document'

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
      // 校验密码
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate((valid) => {
        if (valid) {
          console.log(this.addData.data)
          createDocument({ ...this.addData.data }).then((data) => {
            if (data.success) {
              this.$message.success(data.message)
              this.$emit('back')
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
