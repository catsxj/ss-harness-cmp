<template>
  <div>
    <el-dialog title="修改密码" :visible.sync="addData.dialog" width="40%">
      <el-row>
        <el-alert title="提示" type="info" description="Linux操作系统修改密码账号为root,Windows操作系统修改密码账号为Administrator" class="m-b-lg"> </el-alert>
        <basic-form label-width="120px" :model="addData.data" ref="data">
          <basic-form-item label="新密码：" prop="newPassword" validate="required">
            <el-input type="password" v-model="addData.data.newPassword" auto-complete="off"></el-input>
          </basic-form-item>
          <basic-form-item label="确认密码：" prop="confirmPassword" validate="required">
            <el-input type="password" v-model="addData.data.confirmPassword" auto-complete="off"></el-input>
          </basic-form-item>
        </basic-form>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
        <el-button type="primary" @click="ok">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { modifyVmOpPassword } from 'services/platform/index'
import crypto from 'utils/crypto'

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
      regionList: []
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          if (this.addData.data.newPassword != this.addData.data.confirmPassword) {
            return this.$message.error('密码输入不一致!')
          }
          const updateData = {
            id: this.addData.data.id,
            vendorId: this.addData.data.vendorId,
            password: crypto.encrypt(this.addData.data.newPassword)
          }
          modifyVmOpPassword(updateData).then(data => {
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
