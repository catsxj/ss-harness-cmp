<template>
  <div>
    <el-dialog title="修改密码" :visible.sync="addData.dialog" width="40%">
      <span>
        <el-form ref="passwordData" :model="addData.data" :status-icon="true" label-width="80px">
          <el-form-item label="密码：" prop="password" :rules="rules1">
            <el-popover ref="popover" placement="right" trigger="hover">
              <div>
                <span v-if="addData.data.password">
                  <Icon type="icon-ok" style="color: #0fd59d" v-if="popover1Obj.length" />
                  <Icon type="icon-icon-31" style="color: #d35e5c" v-else />
                </span>
                长度为8到128位
              </div>
              <div>
                <span v-if="addData.data.password">
                  <Icon type="icon-ok" style="color: #0fd59d" v-if="popover1Obj.intension" />
                  <Icon type="icon-icon-31" style="color: #d35e5c" v-else />
                </span>
                大小写字母,数字及特殊字符需包含三种
              </div>
            </el-popover>
            <el-input type="password" v-model="addData.data.password" v-popover:popover show-password></el-input>
            <el-input type="password" v-model="addData.data.endPassword" show-password></el-input>
          </el-form-item>
        </el-form>
      </span>
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
import crypto from 'utils/crypto.js'
var validate1 = (rule, value, callback) => {
  const reg = new RegExp('^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z_!@#$%^&*`~()-+=]+$)(?![0-9_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9_!@#$%^&*`~()-+=]{8,30}$')
  if (reg.test(value) && value.length >= 8 && value.length <= 128) {
    callback()
  } else {
    callback(new Error(' '))
  }
}
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
  watch: {
    'addData.data.password'() {
      const reg = new RegExp('^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z_!@#$%^&*`~()-+=]+$)(?![0-9_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9_!@#$%^&*`~()-+=]{8,30}$')
      this.popover1Obj = {
        length: this.addData.data.password.length >= 8 && this.addData.data.password.length <= 128,
        intension: reg.test(this.addData.data.password),
        indexOf: this.addData.data.password != this.addData.administratorName
      }
    }
  },
  data() {
    return {
      rules1: [{ required: true, message: ' ', trigger: 'blur' }, { validator: validate1 }],
      popover1Obj: {
        length: true,
        intension: true,
        indexOf: true
      },
      loading: false
    }
  },
  methods: {
    ok() {
      this.$refs.passwordData.validate(valid => {
        if (valid) {
          if (this.addData.data.password != this.addData.data.endPassword) return this.$message.error('密码输入不一致')
          this.loading = true
          putRedis('resetPassword', {
            id: this.addData.data.id,
            administratorPassword: crypto.encrypt(this.addData.data.password)
          }).then(data => {
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
