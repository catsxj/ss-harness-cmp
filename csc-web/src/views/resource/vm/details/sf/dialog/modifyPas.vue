<template>
  <div>
    <el-dialog append-to-body title="修改密码" width="40%" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
      <basic-form :model="addData.data" status-icon ref="data" label-width="100px">
        <el-alert title="提示" type="info" description="Linux操作系统修改密码账号为root,Windows操作系统修改密码账号为Administrator" class="m-b-lg"> </el-alert>
        <basic-form-item label="原密码：" prop="oldPasswd" validate="required" required-message="请输入原密码">
          <el-input type="password" v-model="addData.data.oldPasswd"></el-input>
        </basic-form-item>
        <basic-form-item label="新密码：" prop="newPasswd" validate="required" required-message="请输入新密码">
          <el-input type="password" v-model="addData.data.newPasswd"></el-input>
        </basic-form-item>
        <basic-form-item label="确认密码：" prop="endPasswd" validate="required" required-message="请确认密码">
          <el-input type="password" v-model="addData.data.endPasswd"></el-input>
        </basic-form-item>
      </basic-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="ghost" @click.native="addData.dialog = false">取消</el-button>
        <el-button type="primary" @click.native="ok">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/* global $ */
import { modifyVmVcPassword } from 'services/platform/index'
import crypto from 'utils/crypto.js'

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
    },
    vendorId: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {}
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          if (this.addData.data.newPasswd != this.addData.data.endPasswd) {
            return this.$message.error('密码输入不一致!')
          }
          const obj = {
            id: this.addData.data.id,
            oldPasswd: crypto.encrypt(this.addData.data.oldPasswd),
            newPasswd: crypto.encrypt(this.addData.data.newPasswd),
            endPasswd: crypto.encrypt(this.addData.data.endPasswd)
          }
          modifyVmVcPassword(obj).then(data => {
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
