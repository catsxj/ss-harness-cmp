<template>
  <div>
    <basic-form-item label="短信验证码：" prop="messageCode" validate="required">
      <el-row>
        <el-col :span="17">
          <el-input v-model="addData.messageCode"></el-input>
        </el-col>
        <el-col :span="5" :offset="1">
          <el-button type="primary" class="input-code-btn" :disabled="btnDisabled" @click="captcha">{{ typeof captchaTitle == 'number' ? captchaTitle + '秒' : captchaTitle }}</el-button>
        </el-col>
      </el-row>
    </basic-form-item>
  </div>
</template>

<script>
/* global $ */
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
  computed: {
    userData() {
      return this.$store.state.app.userData
    }
  },
  data() {
    return {
      router: this.$route.query,
      btnDisabled: false,
      captchaTitle: '发送验证码'
    }
  },
  methods: {
    captcha() {
      this.$http({
        url: '/captcha/telmessage',
        method: 'GET'
      }).then(data => {
        if (data.success) {
          this.captchaTitle = 120
          this.btnDisabled = true
          this.$message.success('已发送验证码！')
          const clear = setInterval(() => {
            this.captchaTitle = this.captchaTitle - 1
            if (this.captchaTitle == 0) {
              clearInterval(clear)
              this.captchaTitle = '再次发送验证码'
              this.btnDisabled = false
            }
          }, 1000)
        }
      })
    },
    ok() {
      this.$refs.data1.validate(valid => {
        if (valid) {
          if (this.addData.messageCode) this.$emit('back')
          else return this.$message.error('请输入手机短信返回的验证码！')
        }
      })
    }
  }
}
</script>

<style scoped></style>
