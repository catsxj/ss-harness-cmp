<template>
  <el-dialog title="手机验证" :visible.sync="addData.dialog" width="30%" append-to-body>
    <basic-form ref="data1" :model="addData.data" label-width="120px" @submit.native.prevent>
      <basic-form-item label="你绑定的手机：">
        <el-row>
          <el-col :span="15">
            {{ mobile.substr(0, 3) + '****' + mobile.substr(7) }}
          </el-col>
        </el-row>
      </basic-form-item>
      <VerifyCode :add-data="addData.data"></VerifyCode>
    </basic-form>
    <span slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="addData.dialog = false">取 消</el-button>
      <el-button type="primary" @click="ok">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
/* global $ */
import VerifyCode from './VerifyCode'
export default {
  components: { VerifyCode },
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
  computed: {
    mobile() {
      const userData = this.$store.state.app.userData
      return userData.managerMobile || userData.mobile
    }
  },
  data() {
    return {
      router: this.$route.query,
      btnDisabled: false,
      captchaTitle: '发送验证码',
      codeUrl: ''
    }
  },
  methods: {
    ok() {
      this.$refs.data1.validate(valid => {
        if (valid) {
          if (this.addData.data.messageCode) this.$emit('back')
          else return this.$message.error('请输入手机短信返回的验证码！')
        }
      })
    }
  }
}
</script>

<style scoped>
.input-code {
  width: 100%;
}
.code-style {
  width: 95px;
  height: 100%;
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 130px;
}
.input-code-btn {
  width: 130px;
  height: 100%;
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0px;
}
</style>
