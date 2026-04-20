<template>
  <div>
    <el-dialog append-to-body title="重设主机密码" width="40%" :close-on-click-modal="false" v-if="addData.dialog" :visible.sync="addData.dialog">
      <el-form :model="addData.data" :rules="rules" status-icon ref="data" label-width="100px" class="demo-ruleForm">
        <!-- <el-alert class="m-b-md"
          title="Linux机器密码需8到16位，Windows 机器密码需12到30位，至少包括三项（[a-z],[A-Z],[0-9]和[()`~!@#$%^&*-+=_|{}[]:;'<>,.?/]的特殊符号），且Windows不得包含用户名，如：“administrator”（大小写不敏感）"
          type="warning">
        </el-alert> -->
        <el-alert class="m-b-md" title="运行中的云主机需重启新密码方可生效" type="warning"> </el-alert>
        <el-form-item label="新密码：" prop="newPasswd">
          <el-input type="password" v-model="addData.data.newPasswd"></el-input>
        </el-form-item>
        <el-form-item label="确认密码：" prop="checkPass">
          <el-input type="password" v-model="addData.data.checkPass"></el-input>
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
import { modifyVmVcPassword } from 'services/platform/index'
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
    },
    vendorId: {
      type: Number,
      default: 0
    }
  },
  data() {
    // 重置密码验证
    var validatePass = (rule, value, callback) => {
      const reg = new RegExp('^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z_!@#$%^&*`~()-+=]+$)(?![0-9_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9_!@#$%^&*`~()-+=]{8,30}$')
      if (!reg.test(value)) {
        callback(new Error('密码不符合规范'))
      } else {
        if (this.addData.data.checkPass !== '') {
          this.$refs.data.validateField('checkPass')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.addData.data.newPasswd) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      // 校验密码
      rules: {
        newPasswd: [
          { validator: validatePass, trigger: 'blur' },
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, max: 30, message: '长度在 8 到 30 个字符', trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass2, trigger: 'blur' },
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 8, max: 30, message: '长度在 8 到 30 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入镜像名称', trigger: 'blur' },
          { pattern: /^[A-Za-z0-9_\-\u4e00-\u9fa5]+$/, message: '只支持字母、数字或连接符号' }
        ]
      }
    }
  },
  methods: {
    ok() {
      this.$refs.data.validate(valid => {
        if (valid) {
          const obj = JSON.parse(JSON.stringify(this.addData.data))
          obj.newPasswd = crypto.encrypt(obj.newPasswd)
          obj.checkPass = crypto.encrypt(obj.checkPass)
          modifyVmVcPassword(obj).then(data => {
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
