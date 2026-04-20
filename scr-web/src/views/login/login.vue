<template>
  <div class="login-container" :style="{background: `url(${configs.loginBg || 'static/img/bg_login.png'})`}">
    <div class="login-logo">
      <img :src="configs.loginLogo" alt="">
    </div>
    <div class="login-center">
      <div class="desc-content">
        <span class="desc-title">{{configs.promotionalTitle}}</span>
        <span class="desc-remark">{{configs.promotionalContent}}</span>
      </div>
      <el-form :model="loginForm" ref="loginFormRef" label-position="left" label-width="0px" class="card-box login-form" @keyup.enter.native="handleLogin" status-icon>
        <div class="login-title">账号登录</div>
        <el-form-item class="login-form-item" prop="account" validate="required" required-message="请输入用户名">
          <el-input v-model="loginForm.account" autoComplete="on" placeholder="登录账户">
            <template slot="prepend"><i class="el-icon-user"></i></template>
          </el-input>
        </el-form-item>
        <el-tooltip v-model="capsTooltip" content="大写锁定已打开" placement="right" manual>
          <el-form-item class="login-form-item" prop="password" validate="required" required-message="请输入密码">
            <el-input name="password" v-model="loginForm.password" placeholder="密码" show-password @blur="capsTooltip = false" @keyup.native="checkCapslock">
              <template slot="prepend"><i class="el-icon-lock"></i></template>
            </el-input>
          </el-form-item>
        </el-tooltip>
        <el-form-item>
          <div class="operate-region">
            <span class="remember">
              <el-switch v-model="remember"></el-switch>
              <span class="m-l-xs">记住密码</span>
            </span>
            <a :href="`mailto:${configs.helpInformationLink}`" type="text" class="text-info pull-right help-info" :title="configs.helpInformationContent">{{configs.helpInformationContent}}</a>
          </div>
        </el-form-item>
        <el-button class="login-btn" type="primary" size="medium" :loading="loading" @click="handleLogin">
          登录
        </el-button>
      </el-form>
    </div>
    <div class="copyright-info">{{configs.copyrightInformation}}</div>
  </div>
</template>

<script>
import crypto from 'utils/crypto.js'
import { login, getSystemConfigs } from 'services/system'

import { setLoginData } from './tools'
import { reactive, toRefs, ref, computed } from '@vue/composition-api'
export default {
  setup(props, context) {
    const state = reactive({
      remember: false,
      loginForm: {
        account: '',
        password: ''
      },
      loading: false,
      capsTooltip: false
    })
    // 登录界面配置
    const configs = ref({});
    async function getConfigs() {
      const data = await getSystemConfigs({ category: '界面配置' });
      if (data.success) {
        configs.value = data.data;
      }
    }
    getConfigs();
    const loginFormRef = ref(null)
    const init = () => {
      const local = localStorage.getItem('screenLoginData')
      if (local) {
        const obj = JSON.parse(local)
        state.loginForm.account = obj.account
        state.loginForm.password = crypto.decrypt(obj.password)
        state.remember = true
      }
    }
    init()
    function goLogin(data) {
      // const callback = this.$route.query.callback
      // if (callback) {
      //   location.href = `${this.ssoUrl}/upmsapi/sso/redirect?token=${data.token}&redirect=${callback}`
      //   return
      // }
      setLoginData(data)
      if (state.remember) {
        const obj = {
          account: state.loginForm.account,
          password: crypto.encrypt(state.loginForm.password)
        }
        localStorage.setItem('screenLoginData', JSON.stringify(obj))
      } else {
        localStorage.removeItem('screenLoginData')
      }
      let path = '/screen/list'
      const { $route, $router } = context.root
      const redirect = $route.query.redirect
      if (redirect) {
        path = redirect.split('/#')[1]
      }
      $router.replace(path)
      localStorage.removeItem('lockData')
    }

    function handleLogin() {
      loginFormRef.value.validate((valid) => {
        if (valid) {
          state.loading = true
          const { account, password } = state.loginForm
          login({
            account,
            password: crypto.encrypt(password),
            isManager: true
          })
            .then((data) => {
              if (data.success) {
                goLogin(data.data)
              }
            })
            .finally(() => {
              state.loading = false
            })
        }
      })
    }

    function checkCapslock({ shiftKey, key } = {}) {
      if (key && key.length === 1) {
        if ((shiftKey && key >= 'a' && key <= 'z') || (!shiftKey && key >= 'A' && key <= 'Z')) {
          state.capsTooltip = true
        } else {
          state.capsTooltip = false
        }
      }
      if (key === 'CapsLock' && this.capsTooltip === true) {
        state.capsTooltip = false
      }
    }
    return {
      ...toRefs(state),
      configs,
      loginFormRef,
      handleLogin,
      checkCapslock
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: url('/scr-web/static/img/bg_login.png') #2d3a4b no-repeat;
  background-size: cover;
  .login-logo {
    border-bottom: 1px solid #8b91a1;
    padding: 5px 40px;
    img {
      height: 40px;
    }
  }
  .login-center {
    display: flex;
    flex: 1;
    justify-content: space-around;
    align-items: center;
    .desc-content {
      color: #fff;
      display: flex;
      flex-direction: column;
      margin-top: -150x;
      width: 600px;
      .desc-title {
        font-weight: 700;
        font-style: normal;
        font-size: 38px;
        color: #ffffff;
        margin-bottom: 56px;
      }
      .desc-remark {
        line-height: 40px;
        font-weight: 400;
        font-style: normal;
        font-size: 22px;
        color: #ffffff;
      }
    }
    .login-form {
      box-sizing: border-box;
      width: 380px;
      height: 400px;
      padding: 40px;
      border-radius: 10px;
      background: #fff;
      border-radius: 10px;
      text-align: center;
      font-size: 17px;
      .login-title {
        font-size: 32px;
        color: #333;
        margin-bottom: 41px;
      }
      .operate-region {
        display: flex;
        align-items: center;
        .remember {
          flex: 1;
          text-align: left;
        }
      }
      .login-btn {
        padding: 17px 20px;
        width: 100%;
      }
      .help-info {
        max-width: 130px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .login-form-item {
        ::v-deep {
          .el-input-group__prepend {
            background-color: #fff;
            padding: 0 15px;
            font-size: 25px;
            font-weight: bold;
            border-right: none;
          }
          .el-input__inner {
            height: 48px;
            line-height: 48px;
          }
        }
      }
    }
  }
  .copyright-info {
    padding: 10px 0;
    text-align: center;
    background: rgba(10, 37, 68, 0.6);
    color: #bbbbbb;
  }
}
</style>
